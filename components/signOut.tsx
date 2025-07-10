import { signOut } from "@/actions/user.actions";
import { Button } from "./ui/button";

export default function SignOut() {
	return <Button onClick={signOut}>Abmelden</Button>;
}
