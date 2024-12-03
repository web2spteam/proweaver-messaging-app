"use client";
import { useEffect, useRef, useState } from "react";
import JoditEditor from "../modulesComponents/JoditEditor";
import {
    EyeIcon,
    QuestionMarkCircleIcon,
    CheckCircleIcon as SolidCheckCircleIcon,
    PlusIcon,
} from "@heroicons/react/24/solid";
import {
    TrashIcon,
    ArrowsRightLeftIcon,
    CheckCircleIcon as OutlineCheckCircleIcon,
    XCircleIcon,
    ArrowPathIcon,
    ArrowUpOnSquareIcon,
    ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "flowbite-react";
import DismissableToast from "../DismissableToast";
import debounce from "../../utils/debounce";
import { postData, getData } from "../../hooks/useAxios";

type TestItemErrors = {
    questionError: string | null;
    answerError: string | null;
    choicesError: string | null;
};

interface TestItem {
    questionID?: string | number;
    questionHTML: string;
    questionType: string;
    choices: string[];
    answerIndex: number | null;
    answer: string;
    isPlainText: boolean;
    error: TestItemErrors | null;
}

interface TestFormData {
    test_id?: string | number;
    test_title: string;
    test_text: string; // test_text is now required
    items: ItemFormData[];
    test_status?: number;
}

interface ItemFormData {
    question_id?: string | number;
    question: string;
    is_plain: boolean;
    question_type: string;
    choices?: string[];
    answer: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    test_id: string | number;
    items: (string | number)[];
}

type ToastMessage = { type: string; message: string };

const CreateTest: React.FC = () => {
    const [testID, setTestID] = useState<string | number | undefined>(undefined);
    const testTitleRef = useRef<HTMLInputElement | null>(null);
    const [testTitle, setTestTitle] = useState<string>("");
    const [testTitleError, setTestTitleError] = useState<string | null>();
    const [testText, setTestText] = useState<string>("");
    const [testTextError, setTestTextError] = useState<string | null>(null); // Added error state
    const [items, setItems] = useState<TestItem[]>([
        {
            questionID: undefined,
            questionHTML: "",
            questionType: "multipleChoice",
            choices: ["", "", "", ""],
            answerIndex: null,
            answer: "",
            isPlainText: true,
            error: {
                questionError: null,
                answerError: null,
                choicesError: null,
            },
        },
    ]);
    const [activeItem, setActiveItem] = useState<number>(0);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isSavingAsDraft, setIsSavingAsDraft] = useState<boolean>(false);
    const [message, setMessage] = useState<ToastMessage | null>(null);
    const [toastKey, setToastKey] = useState<number>(0);
    const [loadingModules, setLoadingModules] = useState(true);

    useEffect(() => {
        testTitleRef.current?.focus();
    }, []);

    useEffect(() => {
        const savedTitle = localStorage.getItem("testTitle");
        if (savedTitle) {
            setTestTitle(savedTitle);
        }
    }, []);

    useEffect(() => {
        const savedText = localStorage.getItem("testText");
        if (savedText) {
            setTestText(savedText);
        }
    }, []);

    useEffect(() => {
        const savedItems = localStorage.getItem("testItems");
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    const autoSaveTitle = debounce((testTitle: string) => {
        setIsSaving(true);
        localStorage.setItem("testTitle", testTitle);
        setTimeout(() => {
            setIsSaving(false);
        }, 2000);
    }, 5000);

    const autoSaveText = debounce((testText: string) => {
        setIsSaving(true);
        localStorage.setItem("testText", testText);
        setTimeout(() => {
            setIsSaving(false);
        }, 2000);
    }, 5000);

    const autoSaveItems = debounce((updatedItems: TestItem[]) => {
        setIsSaving(true);
        localStorage.setItem("testItems", JSON.stringify(updatedItems));
        setTimeout(() => {
            setIsSaving(false);
        }, 2000);
    }, 5000);

    const addNewItem = () => {
        const newItem = {
            questionHTML: "",
            questionType: "multipleChoice",
            choices: ["", "", "", ""],
            answerIndex: null,
            answer: "",
            isPlainText: true,
            error: {
                questionError: null,
                answerError: null,
                choicesError: null,
            },
        };

        const updatedItems = [...items, newItem];

        setItems(updatedItems);
        setActiveItem(items.length);

        // Save to localStorage
        autoSaveItems(updatedItems);
    };

    const removeItem = (index: number) => {
        setItems((prevItems) => {
            const updatedItems = prevItems.filter((_, i) => i !== index);
            setActiveItem((prev) => Math.min(updatedItems.length - 1, prev));

            return updatedItems;
        });
    };

    const toggleEditor = (itemIndex: number) => {
        handleItemChange(itemIndex, "isPlainText", !items[itemIndex].isPlainText);
    };

    const handleItemChange = (
        index: number,
        field: keyof TestItem,
        value: any,
    ) => {
        setItems((prevItems) => {
            const updatedItems = prevItems.map((item, i) => {
                if (i === index) {
                    const newItem = { ...item, [field]: value };
                    // Clear errors when question type changes
                    if (field === "questionType") {
                        newItem.error = {
                            questionError: null,
                            answerError: null,
                            choicesError: null,
                        };
                    }
                    return newItem;
                }
                return item;
            });
            // Save to localStorage
            autoSaveItems(updatedItems);
            return updatedItems;
        });
    };

    const handleChoiceChange = (
        itemIndex: number,
        choiceIndex: number,
        value: string,
    ) => {
        const updatedChoices = [...items[itemIndex].choices];
        updatedChoices[choiceIndex] = value;
        handleItemChange(itemIndex, "choices", updatedChoices);
    };

    const addChoice = () => {
        const currentChoices = items[activeItem].choices;
        if (currentChoices.some((choice) => choice === "")) {
            handleItemChange(activeItem, "error", {
                ...items[activeItem].error,
                choicesError: "Fill all choices before adding a new one.",
            });
        } else {
            handleItemChange(activeItem, "choices", [...currentChoices, ""]);
            handleItemChange(activeItem, "error", {
                ...items[activeItem].error,
                choicesError: null,
            });
        }
    };

    const removeChoice = (choiceIndex: number) => {
        setItems((prevItems) =>
            prevItems.map((item, i) => {
                if (i === activeItem) {
                    const updatedChoices = item.choices.filter(
                        (_, idx) => idx !== choiceIndex,
                    );
                    const updatedAnswerIndex =
                        item.answerIndex === choiceIndex
                            ? null
                            : item.answerIndex !== null && choiceIndex < item.answerIndex
                                ? item.answerIndex - 1
                                : item.answerIndex;
                    return {
                        ...item,
                        choices: updatedChoices,
                        answerIndex: updatedAnswerIndex,
                    };
                }
                return item;
            }),
        );
    };

    const setAsAnswer = (choiceIndex: number) => {
        if (!items[activeItem].choices[choiceIndex]) {
            handleItemChange(activeItem, "error", {
                ...items[activeItem].error,
                answerError:
                    "Please enter a valid choice before setting it as the answer.",
            });
        } else {
            handleItemChange(activeItem, "answerIndex", choiceIndex);
            handleItemChange(activeItem, "error", {
                ...items[activeItem].error,
                answerError: null,
            });
        }
    };

    const validateForm = (): boolean => {
        if (!testTitle.trim()) {
            setTestTitleError("Test title cannot be empty.");
            return false;
        }
        setTestTitleError(null);

        if (!testText.trim()) {
            setTestTextError("Test text cannot be empty.");
            return false;
        }
        setTestTextError(null);

        if (!items.length) {
            console.error("Test must have at least one item.");
            return false;
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.questionHTML.trim()) {
                handleItemChange(i, "error", {
                    ...item.error,
                    questionError: "Question cannot be empty.",
                });
                return false;
            }
            handleItemChange(i, "error", { ...item.error, questionError: null });

            if (item.questionType === "multipleChoice") {
                if (item.choices.some((choice) => !choice.trim())) {
                    handleItemChange(i, "error", {
                        ...item.error,
                        choicesError: "All choices must be filled.",
                    });
                    return false;
                }
                if (item.answerIndex === null) {
                    handleItemChange(i, "error", {
                        ...item.error,
                        answerError: "Please select an answer.",
                    });
                    return false;
                }
                handleItemChange(i, "error", {
                    ...item.error,
                    choicesError: null,
                    answerError: null,
                });
            } else if (item.questionType === "trueFalse") {
                if (!item.answer) {
                    handleItemChange(i, "error", {
                        ...item.error,
                        answerError: "Please select an answer.",
                    });
                    return false;
                }
                handleItemChange(i, "error", { ...item.error, answerError: null });
            } else if (item.questionType === "identification") {
                if (!item.answer.trim()) {
                    handleItemChange(i, "error", {
                        ...item.error,
                        answerError: "Answer cannot be empty.",
                    });
                    return false;
                }
                handleItemChange(i, "error", { ...item.error, answerError: null });
            }
        }
        return true;
    };

    const handlePublish = async () => {
        if (validateForm()) {
            const formData: TestFormData = {
                test_id: testID,
                test_title: testTitle,
                test_text: testText, // test_text is now included
                items: items.map((item) => {
                    const itemData: ItemFormData = {
                        question_id: item.questionID,
                        question: item.questionHTML,
                        is_plain: item.isPlainText,
                        question_type: item.questionType,
                        answer:
                            item.questionType !== "multipleChoice"
                                ? item.answer
                                : item.answerIndex
                                    ? item.choices[item.answerIndex]
                                    : "",
                    };

                    if (item.questionType === "multipleChoice") {
                        itemData.choices = item.choices;
                    }

                    return itemData;
                }),
                test_status: 1,
            };

            try {
                setIsSaving(true);
                const result = await postData<ApiResponse, any>("read_compre_test/saveTest", formData);
                if (result.success) {
                    const updatedItems = items.map((item, index) => ({
                        ...item,
                        questionID: result.items[index],
                    }));

                    setItems(updatedItems);
                    setTestID(result.test_id);
                    console.log(result);

                    showMessage({
                        type: "success",
                        message: "The test has been published.",
                    });
                } else {
                    showMessage({
                        type: "danger",
                        message: result.message || "An error occurred while saving the test.",
                    });
                }
            } catch (error) {
                showMessage({
                    type: "danger",
                    message: "An unexpected error occurred. Please try again.",
                });
                console.error("Error occurred saving test: ", error);
            } finally {
                setIsSaving(false);
            }
        } else {
            const firstErrorIndex = items.findIndex((item) => item.error && (item.error.questionError || item.error.answerError || item.error.choicesError));
            if (firstErrorIndex !== -1) {
                setActiveItem(firstErrorIndex);
            }
            showMessage({
                type: "danger",
                message: "Please fill all the required fields.",
            });
        }
    };

    const saveAsDraft = async () => {
        if (!testTitle.trim()) {
            setTestTitleError("Test title cannot be empty.");
            return;
        }
        if (!items.length) {
            console.error("Test must have at least one item.");
            return;
        }

        const formData: TestFormData = {
            test_id: testID,
            test_title: testTitle,
            test_text: testText, // test_text is now included
            items: items.map((item) => {
                const itemData: ItemFormData = {
                    question_id: item.questionID,
                    question: item.questionHTML,
                    is_plain: item.isPlainText,
                    question_type: item.questionType,
                    answer:
                        item.questionType !== "multipleChoice"
                            ? item.answer
                            : item.answerIndex
                                ? item.choices[item.answerIndex]
                                : "",
                };

                if (item.questionType === "multipleChoice") {
                    itemData.choices = item.choices;
                }

                return itemData;
            }),
        };

        try {
            setIsSavingAsDraft(true);
            const result = await postData<ApiResponse, any>(
                "read_compre_test/saveTest",
                formData,
            );
            if (result.success) {
                const updatedItems = items.map((item, index) => ({
                    ...item,
                    questionID: result.items[index],
                }));

                setItems(updatedItems);
                setTestID(result.test_id);
                console.log(result);

                showMessage({
                    type: "success",
                    message: "The test has been saved as a draft.",
                });
            } else {
                showMessage({
                    type: "danger",
                    message: result.message || "An error occurred while saving the test.",
                });
            }
        } catch (error) {
            showMessage({
                type: "danger",
                message: "An unexpected error occurred. Please try again.",
            });
            console.error("Error occurred saving test as draft: ", error);
        } finally {
            setIsSavingAsDraft(false);
        }
    };

    const showMessage = (newMessage: { type: string; message: string }) => {
        setMessage(newMessage);
        setToastKey((prevKey: number) => prevKey + 1);
    };

    return (
        <>
            {message?.message && (
                <DismissableToast
                    key={toastKey}
                    type={message.type || ""}
                    message={message.message || ""}
                />
            )}
            <form>
                <div className="flex w-full flex-wrap-reverse gap-12 rounded-t-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-600 dark:bg-gray-700 sm:flex-nowrap">
                    <div className="mb-3 w-full dark:divide-gray-700 sm:mb-0 sm:block sm:divide-x sm:divide-gray-100">
                        <div>
                            <label htmlFor="first_name" className="sr-only">
                                Test Title
                            </label>
                            <input
                                type="text"
                                ref={testTitleRef}
                                value={testTitle}
                                id="test_title"
                                className="block w-full rounded-lg border-none bg-gray-50 p-2.5 text-2xl text-gray-900 caret-blue-500 placeholder:text-black focus:border-2 focus:border-solid focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
                                placeholder="Test Title here"
                                onChange={(e) => {
                                    setTestTitle(e.target.value);
                                    autoSaveTitle(e.target.value);
                                    setTestTitleError(
                                        e.target.value.length === 0
                                            ? "Test title cannot be empty."
                                            : null,
                                    );
                                }}
                            />
                            {testTitleError && (
                                <p className="mb-4 mt-2 text-xs italic text-red-500">
                                    {testTitleError}
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="test_text" className="sr-only">
                                Test/Story
                            </label>
                            <textarea
                                id="test_text"
                                rows={1}
                                value={testText}
                                className="block w-full rounded-lg border-none bg-gray-50 p-2.5 text-sm text-gray-900 focus:border focus:border-solid focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                placeholder="+ Add Text/Story"
                                onChange={(e) => {
                                    setTestText(e.target.value);
                                    autoSaveText(e.target.value);
                                    setTestTextError(e.target.value.length === 0 ? "Test text cannot be empty." : null);
                                }}
                            />
                            {testTextError && (
                                <p className="mb-4 mt-2 text-xs italic text-red-500">
                                    {testTextError}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="ml-auto flex w-full items-start space-x-2 sm:w-auto sm:space-x-3">
                        {isSaving && (
                            <div className="inline-flex items-center pt-2 text-sm text-gray-600">
                                <ArrowPathIcon className="me-2 size-5" />
                                Saving...
                            </div>
                        )}
                        <button
                            type="button"
                            className="inline-flex w-1/2 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-36"
                            onClick={saveAsDraft}
                            disabled={isSavingAsDraft}
                        >
                            {isSavingAsDraft ? (
                                <>
                                    <ArrowPathIcon className="-ml-1 mr-2 size-5" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <ClipboardDocumentCheckIcon className="-ml-1 mr-2 size-5" />
                                    Save as Draft
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            className="inline-flex w-1/2 items-center justify-center rounded-lg border-0 border-gray-300 bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 sm:w-28"
                            onClick={handlePublish}
                        >
                            <ArrowUpOnSquareIcon className="-ml-1 mr-2 size-5" />
                            Publish
                        </button>
                    </div>
                </div>
                <div className="w-full rounded-b-xl border border-t-0 border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-gray-700">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-3 md:col-span-1">
                            <div className="w-full gap-4 rounded-t-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                Items
                            </div>
                            <div className="w-full rounded-b-xl border border-t-0 border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                <div
                                    className="col-auto grid gap-2"
                                    style={{
                                        gridTemplateColumns:
                                            "repeat(auto-fit, minmax(40px, max-content))",
                                    }}
                                >
                                    {items.map((_, i) => (
                                        <button
                                            type="button"
                                            key={i}
                                            onClick={() => setActiveItem(i)}
                                            className={`flex size-9 items-center justify-center rounded-md ${activeItem === i
                                                ? "bg-blue-700 text-white"
                                                : "bg-gray-200 hover:bg-blue-700 hover:text-white"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <Tooltip content="Add Item(s)" placement="right">
                                        <button
                                            type="button"
                                            onClick={addNewItem}
                                            className="flex size-8 items-center justify-center rounded-lg border-2 border-dashed border-gray-400 bg-white text-gray-500 hover:border-blue-500 hover:text-blue-600"
                                        >
                                            <PlusIcon className="size-5" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 md:col-span-2">
                            {items.map((item, itemIndex) =>
                                activeItem === itemIndex ? (
                                    <div key={`item-${itemIndex}`}>
                                        <div className="flex justify-between gap-12 rounded-t-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                            <div className="flex items-center">
                                                <QuestionMarkCircleIcon className="me-2 size-5 text-blue-700" />
                                                <span className="me-6 font-semibold">
                                                    Item {itemIndex + 1}
                                                </span>
                                                {/* <div>
                                                    <label
                                                        htmlFor={`question_type_${itemIndex}`}
                                                        className="sr-only"
                                                    >
                                                        Select question type
                                                    </label>
                                                    <select
                                                        id={`question_type_${itemIndex}`}
                                                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                                        value={item.questionType}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                itemIndex,
                                                                "questionType",
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="" hidden>
                                                            Question Type
                                                        </option>
                                                        <option value="multipleChoice">
                                                            Multiple Choice
                                                        </option>
                                                        <option value="trueFalse">True/False</option>
                                                        <option value="identification">
                                                            Identification
                                                        </option>
                                                    </select>
                                                </div> */}
                                            </div>
                                            {items.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="text-gray-400 hover:text-red-700"
                                                >
                                                    <TrashIcon className="size-5" onClick={() => removeItem(itemIndex)} />
                                                </button>
                                            )}
                                        </div>
                                        <div className="w-full rounded-b-xl border border-t-0 border-gray-200 bg-white p-4 dark:border-gray-600 dark:bg-gray-700">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span>Question</span>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center rounded-lg border border-blue-700 px-5 py-1.5 text-center text-xs font-medium text-blue-700 hover:bg-blue-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleEditor(itemIndex);
                                                    }}
                                                >
                                                    <ArrowsRightLeftIcon className="me-2 size-5" />
                                                    {items[activeItem]?.isPlainText
                                                        ? "Rich Text"
                                                        : "Plain Text"}
                                                </button>
                                            </div>

                                            {items[activeItem]?.isPlainText ? (
                                                <>
                                                    <textarea
                                                        rows={2}
                                                        value={item.questionHTML}
                                                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                                                        onChange={(e) => {
                                                            handleItemChange(
                                                                itemIndex,
                                                                "questionHTML",
                                                                e.target.value,
                                                            );
                                                            if (e.target.value.length === 0) {
                                                                handleItemChange(activeItem, "error", {
                                                                    ...items[activeItem].error,
                                                                    questionError:
                                                                        "Item question must not be empty.",
                                                                });
                                                            } else {
                                                                handleItemChange(activeItem, "error", {
                                                                    ...items[activeItem].error,
                                                                    questionError: null,
                                                                });
                                                            }
                                                        }}
                                                        placeholder="Enter question here..."
                                                    />
                                                    {items[activeItem]?.error?.questionError && (
                                                        <p className="mb-4 mt-2 text-xs italic text-red-500">
                                                            {items[activeItem]?.error?.questionError}
                                                        </p>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <JoditEditor
                                                        value={item.questionHTML}
                                                        onChange={(e) => {
                                                            handleItemChange(itemIndex, "questionHTML", e);
                                                            if (e === "<p><br></p>") {
                                                                handleItemChange(activeItem, "error", {
                                                                    ...items[activeItem].error,
                                                                    questionError:
                                                                        "Item question must not be empty.",
                                                                });
                                                            } else {
                                                                handleItemChange(activeItem, "error", {
                                                                    ...items[activeItem].error,
                                                                    questionError: null,
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    {items[activeItem]?.error?.questionError && (
                                                        <p className="mb-4 mt-2 text-xs italic text-red-500">
                                                            {items[activeItem]?.error?.questionError}
                                                        </p>
                                                    )}
                                                </>
                                            )}

                                            {items[activeItem]?.questionType === "multipleChoice" && (
                                                <>
                                                    <div className="mt-4">
                                                        <label>Answer</label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                items[activeItem]?.choices[
                                                                items[activeItem]?.answerIndex ?? 0
                                                                ] || ""
                                                            }
                                                            readOnly
                                                            placeholder="Selected answer will appear here"
                                                            className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-900"
                                                            onChange={(e) =>
                                                                handleItemChange(
                                                                    itemIndex,
                                                                    "answer",
                                                                    e.target.value,
                                                                )
                                                            }
                                                        />
                                                        {items[activeItem]?.error?.answerError && (
                                                            <p className="mb-4 mt-2 text-xs italic text-red-500">
                                                                {items[activeItem]?.error?.answerError}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="mt-4">
                                                        <label>Choices</label>
                                                        <div className="mt-2">
                                                            {items[activeItem]?.choices.map(
                                                                (choice, choiceIndex) => (
                                                                    <div
                                                                        key={`choice-${activeItem}-${choiceIndex}`}
                                                                        className="group flex items-center"
                                                                    >
                                                                        <div className="relative w-full">
                                                                            <input
                                                                                type="text"
                                                                                placeholder={`Choice ${String.fromCharCode(65 + choiceIndex)}`}
                                                                                className={`mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 ${items[activeItem]?.answerIndex ===
                                                                                    choiceIndex &&
                                                                                    "border-blue-500 bg-blue-200/75 ring-2 ring-blue-500"
                                                                                    }`}
                                                                                onChange={(e) =>
                                                                                    handleChoiceChange(
                                                                                        activeItem,
                                                                                        choiceIndex,
                                                                                        e.target.value,
                                                                                    )
                                                                                }
                                                                                value={choice}
                                                                            />
                                                                            {items[activeItem]?.answerIndex ===
                                                                                choiceIndex && (
                                                                                    <SolidCheckCircleIcon className="absolute right-2.5 top-2.5 size-5 text-blue-700" />
                                                                                )}
                                                                        </div>

                                                                        <div className="mb-2 ml-2 hidden gap-1 group-hover:flex">
                                                                            <Tooltip content="Set as Answer">
                                                                                <button
                                                                                    type="button"
                                                                                    className="text-blue-500"
                                                                                    onClick={() =>
                                                                                        setAsAnswer(choiceIndex)
                                                                                    }
                                                                                >
                                                                                    <OutlineCheckCircleIcon className="size-5" />
                                                                                </button>
                                                                            </Tooltip>
                                                                            {items[activeItem].choices.length > 2 && (
                                                                                <Tooltip content="Remove">
                                                                                    <button
                                                                                        type="button"
                                                                                        className="text-red-500"
                                                                                        onClick={() =>
                                                                                            removeChoice(choiceIndex)
                                                                                        }
                                                                                    >
                                                                                        <XCircleIcon className="size-5" />
                                                                                    </button>
                                                                                </Tooltip>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                        {items[activeItem]?.error?.choicesError && (
                                                            <p className="text-xs italic text-red-500">
                                                                {items[activeItem]?.error?.choicesError}
                                                            </p>
                                                        )}

                                                        <button type="button"
                                                            className="mt-2 text-blue-500"
                                                            onClick={addChoice}
                                                        >
                                                            + Add more choice
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {items[activeItem]?.questionType === "trueFalse" && (
                                                <div className="mt-4">
                                                    <label>Answer</label>
                                                    <div className="mt-2 flex w-full space-x-4">
                                                        <label className="relative flex w-1/2 items-center">
                                                            <input
                                                                type="radio"
                                                                name="trueFalse"
                                                                value="True"
                                                                className="peer hidden"
                                                                onChange={(
                                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                                ) =>
                                                                    handleItemChange(
                                                                        itemIndex,
                                                                        "answer",
                                                                        e.currentTarget.value,
                                                                    )
                                                                }
                                                                checked={items[activeItem]?.answer === "True"}
                                                            />
                                                            <span className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-gray-900 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-100 peer-checked:ring-2 peer-checked:ring-blue-500">
                                                                True
                                                            </span>
                                                            <SolidCheckCircleIcon className="absolute right-2.5 top-2.5 hidden size-5 text-blue-700 peer-checked:block" />
                                                        </label>
                                                        <label className="relative flex w-1/2 items-center">
                                                            <input
                                                                type="radio"
                                                                name="trueFalse"
                                                                value="False"
                                                                className="peer hidden"
                                                                onChange={(
                                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                                ) =>
                                                                    handleItemChange(
                                                                        itemIndex,
                                                                        "answer",
                                                                        e.currentTarget.value,
                                                                    )
                                                                }
                                                                checked={items[activeItem]?.answer === "False"}
                                                            />
                                                            <span className="w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-gray-900 transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-100 peer-checked:ring-2 peer-checked:ring-blue-500">
                                                                False
                                                            </span>
                                                            <SolidCheckCircleIcon className="absolute right-2.5 top-2.5 hidden size-5 text-blue-700 peer-checked:block" />
                                                        </label>
                                                    </div>
                                                </div>
                                            )}
                                            {items[activeItem]?.questionType === "identification" && (
                                                <div className="mt-4">
                                                    <label>Answer</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter the correct answer"
                                                        className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900"
                                                        value={items[activeItem]?.answer}
                                                        onChange={(e) =>
                                                            handleItemChange(
                                                                itemIndex,
                                                                "answer",
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null,
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
};

export default CreateTest;


