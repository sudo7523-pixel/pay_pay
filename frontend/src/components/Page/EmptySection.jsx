import EmptyState from '../EmptyState/EmptyState'

export default function EmptySection({ icon, title, description, action }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={action}
    />
  )
}
