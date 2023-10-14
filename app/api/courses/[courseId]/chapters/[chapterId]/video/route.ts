import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Mux from "@mux/mux-node";
const { Video } = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!,
);

const muxId = crypto.randomUUID()

export async function PATCH (request: Request, { params: { courseId, chapterId }}: { params: { courseId: string, chapterId: string}}) {
    try {
          const { videoUrl  } = await request.json();
        const { userId } = auth();

        if(!videoUrl) {
            return new NextResponse('Video Url is required', { status: 400 });
        }
        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        };


        // check if own course
         const courseQuery = `SELECT * FROM course WHERE id = ?`;
    const courseParams = [courseId];
    const courseRes = await cassandraDb.execute(courseQuery, courseParams, { prepare: true })
    const courseData = courseRes.rows.map(row => ({
      id: row.id.toString(),
      userId: row.user_id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      price: row.price,
      isPublished: row.is_published,
      categoryId: row.category_id?.toString(),

    }));

    const courseOwner = courseData.find(user => user.userId === userId);
    if(!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    };


    // update chapter

    const chapter = {
        chapterId,
        courseId,
        videoUrl
    }

    const updateQuery = `UPDATE chapter_by_course SET video_url = ? WHERE id = ?`;
    const params = [videoUrl, chapterId];
    await cassandraDb.execute(updateQuery, params, { prepare: true })
    .then(() => console.log('Updated succcesfully'))
    .catch(err => console.log(err));


    if(videoUrl) {
        const existingQuery = `SELECT * FROM mux_data_by_course`;
        const existingRes = await cassandraDb.execute(existingQuery, [], { prepare: true });
        const existingMuxData = existingRes.rows.map((row) => ({
            id: row.id?.toString(),
            assetId: row.asset_id,
            playbackId: row.playback_id,
            chapterId: row.chapter_id?.toString(),
          }));

          const existingMuxVideoData = existingMuxData.find(data => data.chapterId === chapterId);
          if(existingMuxVideoData) {
            await Video.Assets.del(existingMuxVideoData.assetId);


            // delete chapter data

            const deleteQuery = `DELETE FROM mux_data_by_course WHERE id = ?`;
            const deleteParams = [existingMuxVideoData.id];
            await cassandraDb.execute(deleteQuery, deleteParams, { prepare: true })
            .then(() => console.log('Deleted succcesfully'))
            .catch(err => console.log(err));
           
          }
          const asset = await Video.Assets.create({
            input: videoUrl,
            playback_policy: "public",
            test: false,
          });

          const insertQuery = `INSERT INTO mux_data_by_course (id, asset_id, playback_id, chapter_id) VALUES (?, ?, ?, ?)`;
          const insertParams = [muxId, asset.id, asset.playback_ids?.[0]?.id, chapterId];
          await cassandraDb.execute(insertQuery, insertParams, { prepare: true })
          .then(() => console.log('Inserted succcesfully'))
          .catch(err => console.log(err));

        

    }
    

    return NextResponse.json(chapter)




        

    }    catch (error) {
        console.log('[DESCRIPTION_PATCH]', error);
        return new NextResponse('Internal error', { status: 500 })
        
    }
}
