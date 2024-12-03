"use client";
import { useState } from "react";
import {
  useCreateUserWithEmailAndPassword,
  useSendEmailVerification,
} from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config";
import { postData } from "@/app/hooks/useAxios";
import DangerAlert from "../DangerAlert";
import { useRouter } from "next/navigation";
import { Alert } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

interface StudentNameRequest {
  first_name: string;
  last_name: string;
}

interface EmailRequest {
  email: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
}

function SignUpForm() {
  const router = useRouter();

  // State Variables
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | undefined>(
    undefined,
  );
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | undefined
  >(undefined);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [firstNameError, setFirstNameError] = useState<string | undefined>(
    undefined,
  );
  const [lastNameError, setLastNameError] = useState<string | undefined>(
    undefined,
  );
  const [usernameError, setUsernameError] = useState<string | undefined>(
    undefined,
  );
  const [isCoordinator, setIsCoordinator] = useState<boolean>(false);
  const [keycode, setKeyCode] = useState<number>(0);
  const [keyCodeError, setkeyCodeError] = useState<string | undefined>(
    undefined,
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Keycode for Coordinator Registration
  const currentKeyCode: number = 765558;

  // Firebase Hooks
  const [createUserWithEmailAndPassword, user, loading, authError] =
    useCreateUserWithEmailAndPassword(auth);
  const [sendEmailVerification, sending, verificationError] =
    useSendEmailVerification(auth);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validatePassword = (password: string): boolean => {
    // Updated regex to include more special characters
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;'"<>,.?/~`-])[A-Za-z\d!@#$%^&*()_+={}\[\]|\\:;'"<>,.?/~`-]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let isValid = true;

    // Clear existing errors
    setEmailError(undefined);
    setPasswordError(undefined);
    setConfirmPasswordError(undefined);
    setFirstNameError(undefined);
    setLastNameError(undefined);
    setUsernameError(undefined);
    setkeyCodeError(undefined);
    setErrorMessage(undefined);

    // Validate email
    if (!email) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email address.");
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters long, contain letters, numbers, and special characters.",
      );
      isValid = false;
    }

    // Validate confirm password
    if (password && confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    }

    // Validate first name, last name, and username
    const fields = [
      { value: firstName, setter: setFirstNameError, fieldName: "First name" },
      { value: lastName, setter: setLastNameError, fieldName: "Last name" },
      { value: username, setter: setUsernameError, fieldName: "Username" },
    ];

    fields.forEach(({ value, setter, fieldName }) => {
      if (!value) {
        setter(`${fieldName} is required.`);
        isValid = false;
      } else {
        setter(undefined);
      }
    });

    // Validate keycode
    if (isCoordinator) {
      if (!keycode) {
        setkeyCodeError("Key code is required.");
        isValid = false;
      } else if (keycode !== currentKeyCode) {
        setkeyCodeError("Incorrect key code.");
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    if (!isCoordinator) {
      const data: StudentNameRequest = {
        first_name: firstName,
        last_name: lastName,
      };
      try {
        const verifyStudent = await postData<ApiResponse, StudentNameRequest>(
          "register/verifyStudent",
          data,
        );
        if (!verifyStudent.success) {
          setErrorMessage(verifyStudent.message);
          return;
        }
      } catch (error) {
        setErrorMessage("Error verifying student.");
        console.error("Error verifying student: ", error);
        return;
      }
    }

    const data: EmailRequest = { email };
    try {
      const verifyEmail = await postData<ApiResponse, EmailRequest>(
        "register/checkEmail",
        data,
      );
      if (verifyEmail.success) {
        const userCredential = await createUserWithEmailAndPassword(
          email,
          password,
        );
        if (authError) {
          switch (authError.code) {
            case "auth/email-already-in-use":
              setEmailError(`The email ${email} is already in use.`);
              break;
            case "auth/invalid-email":
              setEmailError("The email address is not valid.");
              break;
            default:
              setErrorMessage(
                "An unexpected error occurred. Please try again.",
              );
              break;
          }
          return;
        }

        if (userCredential) {
          const formData = {
            account_id: userCredential.user.uid || null,
            email: userCredential.user.email || null,
            first_name: firstName,
            last_name: lastName,
            username: username,
            is_coordinator: isCoordinator,
          };
          try {
            setIsLoading(true);
            const result = await postData<ApiResponse, any>(
              "register/createAccount",
              formData,
            );
            if (result.success) {
              router.push("/");
            } else {
              setIsLoading(false);
              setErrorMessage(result.message);
            }
          } catch (error) {
            setErrorMessage("An unexpected error occurred. Please try again.");
            console.error("Error occurred during account creation: ", error);
          }
        }

        // if (process.env.NODE_ENV === "production") {
        //     if (res?.user) {
        //         const verificationSent = await sendEmailVerification(); // Pass user to sendEmailVerification
        //         if (verificationSent) {
        //             console.log(res)
        //             console.log("Verification email sent successfully.");
        //         }
        //     }
        // }
      } else {
        setEmailError(verifyEmail.message);
      }
    } catch (error) {
      setErrorMessage("Error during email validity check");
      console.error("Error during email validity check: ", error);
    }
  };

  const handleEmailChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value: string = event.target.value;
    setEmail(value);
    if (value === "") {
      setEmailError("Email is required.");
    } else if (!emailRegex.test(value)) {
      setEmailError("Invalid email address.");
    } else {
      setEmailError(undefined);
    }
  };

  const handlePasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value: string = event.target.value;
    setPassword(value);

    // Validate password
    if (value === "") {
      setPasswordError("Password is required.");
    } else if (!validatePassword(value)) {
      setPasswordError(
        "Password must be at least 8 characters long, contain letters, numbers, and special characters.",
      );
    } else {
      setPasswordError(undefined);
    }

    // Clear confirm password error if password changes
    if (confirmPassword && confirmPassword !== value) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError(undefined);
    }
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const value: string = event.target.value;
    setConfirmPassword(value);

    // Validate confirm password
    if (password && value !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError(undefined);
    }
  };

  const handleChange =
    (
      setter: React.Dispatch<React.SetStateAction<string>>,
      errorSetter: React.Dispatch<React.SetStateAction<string | undefined>>,
    ) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = event.target;
      setter(value);

      // Determine field name for error message
      const fieldNames: { [key: string]: string } = {
        first_name: "First name",
        last_name: "Last name",
        username: "Username",
      };

      // Update errors
      if (value === "") {
        errorSetter(`${fieldNames[id]} is required.`);
        setErrorMessage("Please fill all the required fields.");
      } else {
        errorSetter(undefined);
        setErrorMessage(undefined);
      }
    };

  return (
    <>
      {errorMessage ? (
        errorMessage === "Already registered" ? (
          <Alert color="warning" icon={HiInformationCircle}>
            You are already registered and your account is active. Please go to{" "}
            <a href="/">Sign In</a>.
          </Alert>
        ) : (
          <DangerAlert title={errorMessage} />
        )
      ) : null}
      <form className="space-y-6" method="POST" onSubmit={handleSignUp}>
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <div className="mt-1">
            <input
              id="first_name"
              name="first_name"
              type="text"
              autoComplete="off"
              placeholder="Juan"
              onChange={handleChange(setFirstName, setFirstNameError)}
              className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${firstNameError ? "border-red-400" : "border-gray-300"}`}
            />
          </div>
          {firstNameError && (
            <p className="text-xs text-red-400">{firstNameError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <div className="mt-1">
            <input
              id="last_name"
              name="last_name"
              type="text"
              autoComplete="off"
              placeholder="Dela Cruz"
              onChange={handleChange(setLastName, setLastNameError)}
              className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${lastNameError ? "border-red-400" : "border-gray-300"}`}
            />
          </div>
          {lastNameError && (
            <p className="text-xs text-red-400">{lastNameError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <div className="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="off"
              placeholder="jdelacruz"
              onChange={handleChange(setUsername, setUsernameError)}
              className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${usernameError ? "border-red-400" : "border-gray-300"}`}
            />
          </div>
          {usernameError && (
            <p className="text-xs text-red-400">{usernameError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="juandelacruz@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
                handleEmailChange(e);
              }}
              className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${emailError ? "border-red-400" : "border-gray-300"}`}
            />
          </div>
          {emailError && <p className="text-xs text-red-400">{emailError}</p>}
          {/* {authError && <p className="text-red-400 text-xs">{authError.code == "auth/email-already-in-use"}</p>} */}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              onChange={handlePasswordChange}
              className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${passwordError ? "border-red-400" : "border-gray-300"}`}
            />
          </div>
          {passwordError && (
            <p className="text-xs text-red-400">{passwordError}</p>
          )}
        </div>

        {/* Conditionally render Confirm Password field */}
        {password && (
          <div>
            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="mt-1">
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                onChange={handleConfirmPasswordChange}
                className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${confirmPasswordError ? "border-red-400" : "border-gray-300"}`}
              />
            </div>
            {confirmPasswordError && (
              <p className="text-xs text-red-400">{confirmPasswordError}</p>
            )}
          </div>
        )}

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            onChange={(e) => setIsCoordinator(e.target.checked)}
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-900"
          >
            Register as Coordinator
          </label>
        </div>

        {isCoordinator && (
          <div>
            <label
              htmlFor="key_code"
              className="block text-sm font-medium text-gray-700"
            >
              Key Code
            </label>
            <div className="mt-1">
              <input
                id="key_code"
                name="key_code"
                type="number"
                autoComplete="off"
                placeholder="000000"
                onChange={(e) => setKeyCode(Number(e.target.value))}
                className={`block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${keyCodeError ? "border-red-400" : "border-gray-300"}`}
              />
            </div>
            {keyCodeError && (
              <p className="text-xs text-red-400">{keyCodeError}</p>
            )}
          </div>
        )}
        <div>
          <button
            type="submit"
            disabled={loading || sending}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading
              ? "Submitting data..."
              : isLoading
                ? "Signing Up..."
                : "Sign Up"}
          </button>
        </div>
      </form>
    </>
  );
}

export default SignUpForm;
