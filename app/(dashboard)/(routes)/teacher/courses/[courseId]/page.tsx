import cassandraDb from "@/cassandra";
import IconBadge from "@/components/ui/icon-badge";
import {auth} from "@clerk/nextjs";
import {CircleDollarSign, File, Layout, ListChecks} from "lucide-react";
import {redirect} from "next/navigation";
import CategoryForm from "./_components/category-form";
import ChaptersForm from "./_components/chapters-form";
import DescriptionForm from "./_components/description-form";
import {ImageForm} from "./_components/image-form";
import PriceForm from "./_components/price-form";
import TitleForm from "./_components/title-form";
import {AttachmentForm} from "./_components/attachments-form";
import Banner from "../../../_components/banner";
import Actions from "./_components/actions";

type Props = {
  params: {
    courseId: string;
  };
};

async function CourseIdPage({params}: Props) {
  const {userId} = auth();

  if (!userId) {
    return redirect("/");
  }

  // courses
  const query = `SELECT * FROM course WHERE id = ?`;
  const queryParams = [params.courseId];

  const response = await cassandraDb.execute(query, queryParams, {
    prepare: true,
  });

  const course = response.rows.map((row) => ({
    id: row.id.toString(),
    userId: row.user_id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    price: row.price,
    isPublished: row.is_published,
    categoryId: row.category_id?.toString(),
  }));

  // categories

  const categoryQuery = `SELECT * FROM category_by_course`;
  const categoryData = await cassandraDb.execute(categoryQuery, [], {
    prepare: true,
  });
  const categories = categoryData.rows.map((row) => ({
    id: row.id.toString(),
    name: row.name,
  }));

  if (!course) {
    return redirect("/");
  }

  // get chapters
  const chapterCategory = `SELECT * FROM chapter_by_course`;
  const chapterData = await cassandraDb.execute(chapterCategory, [], {
    prepare: true,
  });

  // remeber chapter id is here
  const chapters = chapterData.rows
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
  const chaptersToSend = chapters.filter(
    (chapter) => chapter.courseId === params.courseId
  );

  // get attachments

  const attachmentQuery = `SELECT * FROM attachment_by_course`;
  const attachmentData = await cassandraDb.execute(attachmentQuery, [], {
    prepare: true,
  });
  const attachments = attachmentData.rows.map((row) => ({
    id: row.id?.toString(),
    name: row.name,
    url: row.url,
    courseId: row.course_id?.toString(),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  const attachmentsByCourse = attachments.filter(
    (attachment) => attachment.courseId === params.courseId
  );

  const requiredFields = [
    course[0].title,
    course[0].description,
    course[0].imageUrl,
    course[0].categoryId,
    course[0].price,
    chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields} / ${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course[0]?.isPublished && (
        <Banner label="This course is unpublished, it will not be visible to the students" />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-center text-2xl font-medium">Course setup</h1>
            <span className="text-sm text-slate-700">
              Complete all fields {completionText}
            </span>
          </div>
          {/* actions */}
          <Actions
            disabled={!isComplete}
            courseId={course[0].id}
            isPublished={course[0].isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Layout} />
              <h2 className="text-xl">Customize your course</h2>
            </div>
            <TitleForm initialData={course[0]} courseId={params.courseId} />
            <DescriptionForm
              initialData={course[0]}
              courseId={params.courseId}
            />
            <ImageForm initialData={course[0]} courseId={params.courseId} />
            <CategoryForm
              initialData={course[0]}
              courseId={params.courseId}
              options={categories?.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>
          <div className="space-y-6 ">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm
                initialData={course[0]}
                chapters={chaptersToSend}
                courseId={params.courseId}
              />
            </div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={CircleDollarSign} />
              <h2 className="text-xl">Sell you course</h2>
            </div>
            <PriceForm initialData={course[0]} courseId={params.courseId} />
            <div className="flex items-center gap-x-2">
              <IconBadge icon={File} />
              <h2 className="text-xl">Resources & attachments</h2>
            </div>
            <AttachmentForm
              initialData={course[0]}
              courseId={params.courseId}
              attachments={attachmentsByCourse}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseIdPage;
