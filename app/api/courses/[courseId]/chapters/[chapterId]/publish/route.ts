import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import Mux from "@mux/mux-node";

import { NextResponse } from "next/server";
const { Video } = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!,
);

export async function PATCH(request: Request, { params: { courseId, chapterId}}: { params: { courseId: string, chapterId: string}}) {
    try {
        const { userId } = auth();
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

        // find chapter with id
        const chapterQuery = `SELECT * FROM chapter_by_course WHERE id = ?`;
        const chapterParams = [chapterId];
        const chapterRes = await cassandraDb.execute(chapterQuery, chapterParams, { prepare: true });
        const chapterData = chapterRes.rows.map(row => ({
            id: row.id.toString(),
            title: row.title,
            description: row.description,
            courseId: row.course_id?.toString(),
            isPublished: row.is_published,
            isFree: row.is_free,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            position: row.position,
            videoUrl: row.video_url?.toString(),
        }));

        const chapter = chapterData.find((chapter) => chapter.courseId === courseId);

        if(!chapter) {
            return new NextResponse('Chapter is required', { status: 400 })
        }








     
        // find any muxData with chapter id
        const muxQuery = `SELECT * FROM mux_data_by_course`;
        const muxRes = await cassandraDb.execute(muxQuery, [], { prepare: true });
        const muxData = muxRes.rows.map(row => ({
            id: row.id?.toString(),
            assetId: row.asset_id,
            playbackId: row.playback_id,
            chapterId: row.chapter_id?.toString(),

        }));
        const muxDataByChapterId = muxData.find(chapter => chapter.chapterId === chapterId);

        if(!muxDataByChapterId) {
            return new NextResponse('Mux video is required', { status: 400 })
        }
           // update
           const updateQuery = `UPDATE chapter_by_course SET is_published = ? WHERE id = ?`;
           const updateParams = [true, chapterId];
           await cassandraDb.execute(updateQuery, updateParams, { prepare: true })
           .then(() => console.log('Updated succcesfully'))
           .catch(err => console.log(err));



        //    insert USER_PROGRESS
        const progressQuery = `INSERT INTO user_progress_by_course (id, user_id, chapter_id, is_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`;
        const params = [chapterId, userId, chapterId, true, Date.now(), Date.now()];
        await cassandraDb.execute(progressQuery, params, { prepare: true})
        .then(() => console.log('Inserted succcesfully'))
        .catch(err => console.log(err));

        return NextResponse.json(chapter);

   

            


        
    } catch (error) {
        console.log('PUBLISH_PATCH', error);
        return new NextResponse('Internal Errror', { status: 500 })
        
    }
}