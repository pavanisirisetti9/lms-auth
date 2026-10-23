import {
  hashPassword,
  validateEmail,
  generateToken,
} from "../src/utils/authHelpers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

describe("hashPassword", () => {
  it("should hash a password", async () => {
    const hashed = await hashPassword("Test@123");
    expect(hashed).not.toBe("Test@123");
    expect(await bcrypt.compare("Test@123", hashed)).toBe(true);
  });

  it("should generate different hashes for the same password", async () => {
    const first = await hashPassword("Test@123");
    const second = await hashPassword("Test@123");
    expect(first).not.toBe(second);
  });
});

describe("validateEmail", () => {
  it("should accept a valid email", () => {
    expect(validateEmail("student@example.com")).toBe(true);
  });

  it("should reject an invalid email", () => {
    expect(validateEmail("invalid-email")).toBe(false);
  });

  it("should reject an email with spaces", () => {
    expect(validateEmail("student @example.com")).toBe(false);
  });
});

describe("generateToken", () => {
  const payload = {
    id: 1,
    email: "student@example.com",
    role: "student",
  };

  it("should generate a valid JWT", () => {
    const token = generateToken(payload, "test-secret");
    const decoded = jwt.verify(token, "test-secret") as typeof payload;
    expect(decoded.id).toBe(1);
    expect(decoded.email).toBe("student@example.com");
    expect(decoded.role).toBe("student");
  });

  it("should throw when the secret is missing", () => {
    expect(() => generateToken(payload, "")).toThrow(
      "JWT_SECRET is not configured",
    );
  });
});
