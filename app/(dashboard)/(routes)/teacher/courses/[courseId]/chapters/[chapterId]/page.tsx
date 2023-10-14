import cassandraDb from "@/cassandra";
import IconBadge from "@/components/ui/icon-badge";
import {auth} from "@clerk/nextjs";
import {ArrowLeft, Eye, LayoutDashboard, Video} from "lucide-react";
import Link from "next/link";
import {redirect} from "next/navigation";
import ChapterDescriptionForm from "./_components/chapter-description-form";
import ChapterTitleForm from "./_components/chapter-title-form";
import ChaptterAccessForm from "./_components/chapter-access-form";
import ChapterVideoForm from "./_components/chapter-video-form";
import ChapterActions from "./_components/chapter-actions";
import Banner from "@/app/(dashboard)/(routes)/_components/banner";

type Props = {
  params: {
    courseId: string;
    chapterId: string;
  };
};

async function ChapterIdPage({params: {courseId, chapterId}}: Props) {
  const {userId} = auth();
  if (!userId) {
    return redirect("/");
  }

  //   find chapter
  const chapterQuery = `SELECT * FROM chapter_by_course WHERE id = ?`;
  const chapterParams = [chapterId];
  const chapterRes = await cassandraDb.execute(chapterQuery, chapterParams, {
    prepare: true,
  });
  const chapterData = chapterRes.rows
    .map((row) => ({
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
    }))
    .sort((a, b) => a.position - b.position);

  const chapter = chapterData.find((chapter) => chapter.courseId === courseId);

  //   find muxData DATA chapter_id

  const muxDataQuery = `SELECT * FROM mux_data_by_course`;
  const muxDataRes = await cassandraDb.execute(muxDataQuery, [], {
    prepare: true,
  });

  const muxData = muxDataRes.rows.map((row) => ({
    id: row.id?.toString(),
    assetId: row.asset_id,
    playbackId: row.playback_id,
    chapterId: row.chapter_id?.toString(),
  }));

  const muxDataByChapter = muxData.find(
    (muxData) => muxData.chapterId === chapterId
  );

  const requiredFields = [
    chapter?.title,
    chapter?.description,
    chapter?.videoUrl,
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields} completed`;

  const isComplete = requiredFields.every(Boolean); //look everything id true

  return (
    <>
      {!chapter?.isPublished && (
        <Banner
          variant={"warning"}
          label="This chapter is unpublished it will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full ">
            <Link
              href={`/teacher/courses/${courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2 ">
                <h1 className="text-2xl font-medium">Chapter creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
              </div>
              <ChapterActions
                disabled={!isComplete}
                courseId={courseId}
                chapterId={chapterId}
                isPublished={chapter?.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div className="">
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your chapter</h2>
              </div>
              <ChapterTitleForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
              <ChapterDescriptionForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-xl">Access Settings</h2>
              </div>
              <ChaptterAccessForm
                initialData={chapter}
                courseId={courseId}
                chapterId={chapterId}
              />
            </div>
          </div>
          <div>
            <div className="flex gap-x-2 items-center">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2>
            </div>
            <ChapterVideoForm
              chapterId={chapterId}
              courseId={courseId}
              initialData={chapter}
              muxData={muxDataByChapter}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ChapterIdPage;
