export function mapResponseFormErrorsToFormErrors<FormKey extends string>(
  responseFormErrors: Array<{ key: FormKey; message: string }>,
  emptyResultFormErrors: Record<FormKey, string>,
) {
  const formKeys = Object.keys(emptyResultFormErrors) as FormKey[]

  return responseFormErrors.reduce((formErrors, { key, message }) => {
    const formKey = formKeys.find((formKey) => formKey === key)
    if (formKey) {
      formErrors[formKey] = message
    }

    return formErrors
  }, emptyResultFormErrors)
}
