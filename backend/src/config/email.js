import emailjs from "@emailjs/nodejs";
import { AppError } from "../utils/AppError.js";

const getEmailJsConfig = () => {
  const { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, EMAILJS_PRIVATE_KEY } =
    process.env;

  if (
    !EMAILJS_SERVICE_ID ||
    !EMAILJS_TEMPLATE_ID ||
    !EMAILJS_PUBLIC_KEY ||
    !EMAILJS_PRIVATE_KEY
  ) {
    throw new AppError(
      500,
      "INTERNAL_ERROR",
      "Configuration EmailJS incomplète"
    );
  }

  return {
    serviceId: EMAILJS_SERVICE_ID,
    templateId: EMAILJS_TEMPLATE_ID,
    publicKey: EMAILJS_PUBLIC_KEY,
    privateKey: EMAILJS_PRIVATE_KEY,
  };
};

export const sendPasswordResetEmail = async ({ email, resetLink }) => {
  const { serviceId, templateId, publicKey, privateKey } = getEmailJsConfig();

  await emailjs.send(
    serviceId,
    templateId,
    {
      to_email: email,
      reset_link: resetLink,
    },
    { publicKey, privateKey }
  );
};
