"use client";
import {
  FcEngineering,
  FcFilmReel,
  FcHeadset,
  FcMultipleDevices,
  FcMusic,
  FcSportsMode,
} from "react-icons/fc";

import {IconType} from "react-icons";
import CategoryItem from "./category-item";

type Props = {
  items: CategoryProps[];
};

const iconMap: Record<CategoryProps["name"], IconType> = {
  Music: FcMusic,
  Fitness: FcSportsMode,
  Hacking: FcHeadset,
  "Computer Science": FcMultipleDevices,
  Filming: FcFilmReel,
  Engineering: FcEngineering,
};

function Categories({items}: Props) {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items?.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}
    </div>
  );
}

export default Categories;
