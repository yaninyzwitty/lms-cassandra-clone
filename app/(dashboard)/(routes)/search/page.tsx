import cassandraDb from "@/cassandra";
import SearchInput from "@/components/search-input";
import {getCourse} from "@/helpers/get-course";
import {auth} from "@clerk/nextjs";
import {redirect} from "next/navigation";
import Categories from "./_components/categories";
import CoursesList from "./_components/courses-list";

type Props = {
  searchParams: {
    title: string;
    categoryId: string;
  };
};
async function Searchpage({searchParams}: Props) {
  const {userId} = auth();
  if (!userId) {
    return redirect("/");
  }

  // get all categories
  const query = `SELECT * FROM category_by_course`;
  const categoryData = (
    await cassandraDb.execute(query, [], {prepare: true})
  ).rows.map((row) => ({
    id: row.id.toString(),
    name: row.name,
  }));

  // get courses
  const courses = await getCourse({userId, ...searchParams});
  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        <SearchInput />
      </div>
      <div className="p-6 space-y-4">
        <Categories items={categoryData} />

        {courses === undefined && <div>No courses</div>}
        <CoursesList items={courses} />
      </div>
    </>
  );
}

export default Searchpage;
