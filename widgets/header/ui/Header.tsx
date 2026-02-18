import ThemeToggle from "@/feature/theme-toggle/ui/ThemeToggle";
import UserInfoButton from "@/feature/user-info/ui/UserInfoButton";

const Header = () => {
  return (
    <div className="py-3 px-4 flex justify-between">
      <ThemeToggle />
      <UserInfoButton />
    </div>
  );
};

export default Header;
