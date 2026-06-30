export class ForbiddenError extends Error {
  status = 403;
  code = "FORBIDDEN";
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class AccountNotLinkedError extends Error {
  status = 401;
  code = "ACCOUNT_NOT_LINKED";
  constructor(message = "Account not linked to any profile") {
    super(message);
    this.name = "AccountNotLinkedError";
  }
}
