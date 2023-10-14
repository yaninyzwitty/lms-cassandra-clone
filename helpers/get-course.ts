import cassandraDb from "@/cassandra";
import { getProgess } from "./get-progress";

type Props = {
    userId: string;
    title: string;
    categoryId: string
}

export async function getCourse ({   userId,
    title,
    categoryId}: Props) {

        // get courses must be published, contain title, categoryId
        const courseQuery = `SELECT * FROM course`;
        let courseData = (await cassandraDb.execute(courseQuery, [], { prepare: true })).rows.map(row => ({
            id: row.id.toString(),
            userId: row.user_id,
            title: row.title,
            description: row.description,
            imageUrl: row.image_url,
            price: row.price,
            isPublished: row.is_published,
            categoryId: row.category_id?.toString(),

        })).filter(course => course.isPublished && course.categoryId === categoryId);

        if(title) {
            courseData = courseData.filter(course => course.title.toLowerCase().includes(title.toLowerCase()));
        }

        // get category using category id;
        const categoryQuery = `SELECT * FROM category_by_course WHERE id = ?`;
        const categoryParam = [categoryId];
        const categoryData = (await cassandraDb.execute(categoryQuery, categoryParam, { prepare: true })).rows.map(row => ({
            id: row.id.toString(),
            name: row.name,
        })).find(category => category.id === categoryId)

        // get all the chapters id and are published
        const chaptersQuery = `SELECT id, is_published FROM chapter_by_course`;
        const chaptersData = (await cassandraDb.execute(chaptersQuery, [], { prepare: true })).rows.map(row => ({
            id: row.id.toString(),
            isPublished: row.is_published,

        })).filter(chapter => chapter.isPublished);

        // get all course purchases
        const purchasesQuery = `SELECT * FROM purchase_by_course`;
        const purchasesData = (await cassandraDb.execute(purchasesQuery, [], { prepare: true })).rows.map(row => ({
            id: row.id.toString(),
            userId: row.user_id,
            courseId: row.course_id.toString(),
            createdAt: row.created_at,
            updatedAt: row.updated_at,

        })).filter(user => user.userId === userId);

       const courses = {
        courses: courseData,
        category: categoryData,
        chapters: chaptersData,
        purchases: purchasesData
       };


       if(courses.purchases.length === 0) {
        return {
            ...courses,
            progress: null
        }
       };

       const courseWithProgress = await Promise.all(
        courses.courses.map(async course => {
        const progressPercentage = await getProgess(userId, course.id);
        return {
            ...courses,
            progress: progressPercentage
        };

        })
       );
       return courseWithProgress;









       



       









   

}