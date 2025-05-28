enum FrontendErrorType {
  Validation,
  NotFound,
  Unauthorized,
  InternalError,
  NetworkError,
  UnknownError
}

interface ResultSuccess<T> {
  isSuccess: true;
  data: T;
}

interface ResultFailure {
  isSuccess: false;
  errorMessage: string;
  errorType?: FrontendErrorType;
}

type FrontendResult<T> = ResultSuccess<T> | ResultFailure;