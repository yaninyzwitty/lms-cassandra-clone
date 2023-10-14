import Image from "next/image";
import Link from "next/link";
import {BookOpen} from "lucide-react";
import {CourseProgress} from "./course-progress";
import IconBadge from "@/components/ui/icon-badge";
import {formatPrice} from "@/lib/formatPrice";

type Props = {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
};

function CourseCard({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  category,
  progress,
}: Props) {
  return (
    <Link href={`/courses/${id}`}>
      <div className="group-hover:shadow-sm transition overflow-hidden border rounded-lg h-full p-3">
        <div className="relative w-full aspect-video rounded-md overflow-hidden">
          <Image fill className="object-cover" alt={title} src={imageUrl} />
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-lg md:text-base font-medium group-hover:text-sky-700 transition line-clamp-2">
            {title}
          </div>
          <p className="text-xs text-muted-foreground ">{category}</p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <IconBadge size={"sm"} icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? "Chapter" : "Chapters"}
              </span>
            </div>
          </div>
          {progress !== null ? (
            <div>
              <CourseProgress
                size="sm"
                value={progress}
                variant={progress === 10 ? "success" : "default"}
              />
            </div>
          ) : (
            <p className="text-md md:text-sm font-medium text-slate-700">
              {formatPrice(price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
