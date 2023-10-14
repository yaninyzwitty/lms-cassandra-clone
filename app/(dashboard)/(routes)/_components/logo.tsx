import Image from "next/image";

function Logo() {
  return (
    <Image
      src={"logoipsum.svg"}
      alt="Learning Management System"
      height={100}
      width={130}
    />
  );
}

export default Logo;
