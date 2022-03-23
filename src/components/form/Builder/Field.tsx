import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { FieldValidator, useField, useFormikContext } from 'formik'
import styled from 'styled-components'
import { noop, get } from 'lodash'

export const StyledError = styled.div`
  text-align: right;
  color: red;
  font-size: 12px !important;
  line-height: 16px;
`

const OnChangeSubmitSink = ({
  value,
}: {
  value: unknown
}): React.ReactElement => {
  const { submitForm } = useFormikContext()
  useEffect(() => {
    if (value !== undefined) {
      submitForm()
    }
  }, [submitForm, value])

  return <></>
}

const requiredValidate = (name: string) => (v: any) => {
  if (typeof v === 'undefined') return `${name} is Required`
}

type FieldProps<T extends React.ComponentType> = Omit<
  React.ComponentPropsWithoutRef<T>,
  'onChange' | 'value' | 'as'
> & {
  as: T
  submitOnChange?: boolean
  onChange?: (v: any) => void
  onKeyPress?: React.KeyboardEventHandler
  name: string
  validate?: FieldValidator
  touched?: boolean
  required?: boolean
}

/**
 * Superset of <Field /> Component (https://formik.org/docs/api/field)
 * Only additions are these params.
 *
 * @param submitOnChange - If `true`, form will be submitted eveytime this field value changes. Useful in things like search filters, etc.
 * @param onChange - Triggered when falue for this field changes
 * @param required - Will show `$name is required`error when value is not selected.
 * @param touched - mark field as touched on load
 */
const Field: <T extends React.ComponentType>(
  v: FieldProps<T>
) => React.ReactElement = ({
  as: Component,
  submitOnChange = false,
  onChange = undefined,
  onKeyPress = noop,
  name,
  required = false,
  validate = undefined,
  touched = false,
  ...props
}) => {
  const [{ onChange: formikOnChange, ...field }] = useField({
    name,
    validate: validate || required ? requiredValidate(name) : undefined,
  })
  const {
    submitForm,
    setFieldValue,
    validateField,
    setFieldTouched,
    errors,
    touched: allTouched,
  } = useFormikContext()

  const error = get(errors, name)
  const _touched = touched || get(allTouched, name)

  const aggOnChange = useCallback(
    (v) => {
      if (v && v.target) {
        formikOnChange(v)
      } else {
        setFieldValue(name, v)
      }
      onChange?.(v)
    },
    [formikOnChange, name, onChange, setFieldValue]
  )

  const _onKeyPress = useCallback(
    (e) => {
      if (e.charCode === 13) {
        submitForm()
      }
      onKeyPress?.(e)
    },
    [onKeyPress, submitForm]
  )

  useEffect(() => {
    validateField(name)
  }, [name, validate, validateField])

  useEffect(() => {
    if (touched) {
      setFieldTouched(name)
    }
  }, [name, setFieldTouched, touched])

  const errorMessage = useMemo(
    () => <StyledError>{error}</StyledError>,
    [error]
  )
  const CComponent = Component as any

  return (
    <React.Fragment>
      {submitOnChange && <OnChangeSubmitSink value={field.value} />}
      <CComponent
        {...field}
        data-is-field
        onChange={aggOnChange}
        onKeyPress={_onKeyPress}
        {...props}
      />
      {_touched && errorMessage}
    </React.Fragment>
  )
}

const typedMemo: <T>(c: T) => T = memo
export default typedMemo(Field)
