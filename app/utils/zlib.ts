const encodeBase64 = (data: string): string => {
  return Buffer.from(data).toString("base64"); // Encode compressed data
};

const decodeBase64 = (base64: string): string => {
    if (!base64) {
      throw new Error("Input base64 string is empty.");
    }
  
    try {
      const decoded = Buffer.from(base64, "base64");
      return decoded.toString("utf-8");
    } catch (error) {
      console.error("Decoding error:", error);
      throw new Error("Failed to decode. Ensure the Base64 string is valid and properly encoded.");
    }
  };

export { encodeBase64, decodeBase64 };
