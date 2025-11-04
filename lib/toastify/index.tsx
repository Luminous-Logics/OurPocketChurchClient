import { toast } from "react-toastify";

const toaster = {
  error: (message: string | string[]) => {
    const showErr = (msg: string) =>
      toast.error(msg, {
        theme: "colored",
        style: {
          background: "#C13254",
          minHeight: 0,
          fontSize: "0.875rem",
        },
      });

    if (Array.isArray(message)) {
      return message.forEach((item) => showErr(item));
    }

    return showErr(message);
  },
  success: (message: string | string[]) => {
    const showSucc = (msg: string) =>
      toast.success(msg, {
        theme: "colored",
        style: {
          background: "#3ECDAB",
          minHeight: 0,
          fontSize: "0.875rem",
        },
      });

    if (Array.isArray(message)) {
      return message.forEach((item) => showSucc(item));
    }

    return showSucc(message);
  },
};

export default toaster;
