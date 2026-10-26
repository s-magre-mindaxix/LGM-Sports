import logo from "../../assets/GaxceLogo-removebg.png"; 

export default function LogoLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-4">
       <img
        src={logo}
        alt="Loading"
        className="w-22 h-22 logo-spin"
      />
    </div>
  );
}