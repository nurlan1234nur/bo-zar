export enum RoleName {
  USER = "USER",
  ADMIN = "ADMIN",
  MODERATOR = "MODERATOR",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  BLOCKED = "BLOCKED",
}

export enum AdvertisementStatus {
  ACTIVE = "ACTIVE",
  SOLD = "SOLD",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
  HIDDEN = "HIDDEN",
  DELETED = "DELETED",
}

export enum ReportReason {
  SPAM = "SPAM",
  FAKE = "FAKE",
  SCAM = "SCAM",
  DUPLICATE = "DUPLICATE",
  INAPPROPRIATE = "INAPPROPRIATE",
  OTHER = "OTHER",
}

export enum ReportStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}
