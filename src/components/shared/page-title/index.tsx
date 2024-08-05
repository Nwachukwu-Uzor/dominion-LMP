import React from 'react'

type Props = {
    title: string;
}
export const PageTitle: React.FC<Props> = ({title}) => {
  return (
    <h1 className="p-1.5 bg-white text-black shadow-sm font-bold text-lg">{title}</h1>
  )
}
