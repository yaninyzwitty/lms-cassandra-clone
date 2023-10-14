import cassandraDb from "@/cassandra";
import {Button} from "@/components/ui/button";
import {auth} from "@clerk/nextjs";
import {PlusCircle} from "lucide-react";
import Link from "next/link";
import {redirect} from "next/navigation";
import {DataTable} from "./_components/data-table";
import {columns} from "./_components/columns";

async function CoursesPage() {
  const {userId} = auth();
  if (!userId) {
    return redirect("/");
  }

  // get all courses
  const query = `SELECT * FROM course`;
  const courseData = (
    await cassandraDb.execute(query, [], {prepare: true})
  ).rows
    .map((row) => ({
      id: row.id.toString(),
      userId: row.user_id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      price: row.price,
      isPublished: row.is_published,
      categoryId: row.category_id?.toString(),
    }))
    .filter((user) => user.userId === userId);

  return (
    <div className="p-6">
      <DataTable columns={columns} data={courseData} />
    </div>
  );
}

export default CoursesPage;
