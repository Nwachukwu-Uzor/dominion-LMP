export const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error("Could not convert file to Base64"));
        }
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
