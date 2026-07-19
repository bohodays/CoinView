import ThemeToggle from "@/features/theme-toggle/ui/ThemeToggle";

const Header = () => {
  return (
    <div className="py-3 px-4 flex justify-between">
      <ThemeToggle />
    </div>
  );
};

export default Header;
