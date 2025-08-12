import { Button } from "@/components/ui/button";
import { NavigationMenu } from "@/components/ui/navigation-menu";
function Header() {
  return (
    <NavigationMenu />
    // <div className="h-[7vh] flex items-center justify-around text-2xl bg-amber-50 font-semibold text-primary-foreground">
    //   <div>
    //     <h1>Smart Talk</h1>
    //   </div>
    //   <div>
    //     <Button variant="outline" size="lg" color="">
    //       {" "}
    //       Profile
    //     </Button>
    //   </div>
    // </div>
  );
}

export default Header;
