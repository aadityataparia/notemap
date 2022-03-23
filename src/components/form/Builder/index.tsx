import React, { memo, useCallback, useEffect } from 'react'
import { Formik, useFormikContext, FormikConfig } from 'formik'
import { debounce, noop } from 'lodash'
import styled, { StyledComponent } from 'styled-components'
import Field, { StyledError } from './Field'

type OnChangeType<T> = (v: T) => void | Promise<any>

const OnChangeSink: React.FC<{ onChange: OnChangeType<any> }> = memo(
  ({ onChange }) => {
    const { values, errors } = useFormikContext()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const _onChange = useCallback(
      debounce((v) => onChange(v), 100),
      [onChange]
    )

    useEffect(() => {
      const isValid =
        Object.keys(errors).filter((k: unknown) => errors[k] !== undefined)
          .length < 1
      if (isValid) {
        _onChange(values)
      } else {
        _onChange(null)
      }
    }, [_onChange, values, errors])

    return null
  }
)

const Form = styled.form``
const Div = styled.div``
// Works with inputs from ./form folder

export type FormBuilderProps<T> = FormikConfig<T> & {
  'data-is-field'?: boolean
  onChange?: OnChangeType<T>
  style?: React.CSSProperties
  onSubmit: (v: T) => Promise<any>
}
/**
 * Superset of <Formik /> Component (https://formik.org/docs/api/formik)
 * Only additions are these params.
 *
 * @param onChange - This function is triggered everytime any of the form values change
 * @param 'data-is-field' - This is used by Field when we provide a FormBuilder as `as` Component, do not pass it yourself. This enables us to have
 *   any number of nested `FormBuilder`s inside a FormBuilder form.
 */
const FormBuilder: <T>(
  props: FormBuilderProps<T>
) => React.ReactElement | null = memo(
  ({
    children = null,
    'data-is-field': isField = false,
    onChange = null,
    style = {},
    onSubmit,
    initialValues,
    ...formikProps
  }) => {
    const Component: StyledComponent<any, any> = isField ? Form : Div
    const _onSubmit: OnChangeType<typeof initialValues> = isField
      ? noop
      : onSubmit

    return (
      <Formik
        onSubmit={_onSubmit}
        initialValues={initialValues}
        {...formikProps}
      >
        {({ handleReset, handleSubmit }) => (
          <Component
            style={style}
            onReset={handleReset}
            onSubmit={handleSubmit}
          >
            {children}
            {onChange && <OnChangeSink onChange={onChange} />}
          </Component>
        )}
      </Formik>
    )
  }
)

export { FormBuilder, Field, StyledError }
