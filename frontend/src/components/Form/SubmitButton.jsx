import Button from '../Button/Button'

export default function SubmitButton({ children = 'Submit', loading, ...props }) {
  return (
    <Button type="submit" loading={loading} {...props}>
      {children}
    </Button>
  )
}
