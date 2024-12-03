import { getData } from "../hooks/useAxios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config"; // Ensure this is correctly initialized in your config

interface IAccount {
  account_name: string;
  profile_pic: string;
}

const fetchAccountInfo = async () => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const res: IAccount = await getData(
          `account/getAccountInfo/${user.uid}`,
        );

        if (res) {
          return {
            account_name: res.account_name,
            profile_pic: res.profile_pic,
          };
        }
      } catch (error) {
        console.error("Error fetching account info:", error);
      }
    } else {
      console.error("No user is logged in");
    }
  });
};

export default fetchAccountInfo;
