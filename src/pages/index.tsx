import React from 'react';
import Head from 'next/head';

import TodoForm from '@/components/TodoForm';
import TodoItem from '@/components/TodoItem';

interface TypeTodo {
  id: number;
  text: string;
}

export default function Home() {
  const todoList: TypeTodo[] = [
    {
      id: 1,
      text: 'TODO 1',
    },
    {
      id: 2,
      text: 'TODO 2',
    },
  ];

  return (
    <>
      <Head>
        <title>TODO List</title>
      </Head>
      <div>{`TODO #${todoList.length}`}</div>
      <TodoForm />
      <ul>
        {todoList.map((todoItem) => (
          <TodoItem
            key={todoItem.id}
            id={todoItem.id}
            text={todoItem.text}
          />
        ))}
      </ul>
    </>
  );
}
