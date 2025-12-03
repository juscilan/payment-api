export class PaymentException extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'PaymentException';
  }
}

export class PaymentNotFoundException extends PaymentException {
  constructor(id: string) {
    super(`Payment with id ${id} not found`, 'PAYMENT_NOT_FOUND');
  }
}

export class InvalidPaymentDataException extends PaymentException {
  constructor(message: string) {
    super(message, 'INVALID_PAYMENT_DATA');
  }
}

export class ExternalPaymentException extends PaymentException {
  constructor(message: string) {
    super(message, 'EXTERNAL_PAYMENT_ERROR');
  }
}
