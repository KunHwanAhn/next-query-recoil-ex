import React from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { dehydrate, QueryClient, useQuery } from 'react-query';

import { getTodos } from '@/services/index';

import TodoForm from '@/components/TodoForm';
import TodoItem from '@/components/TodoItem';

export const getServerSideProps: GetServerSideProps = async () => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery('todos', getTodos);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function Home() {
  const { isLoading, data: todoList } = useQuery(
    'todos',
    getTodos,
    { staleTime: 5 * 1000 },
  );

  return (
    <>
      <Head>
        <title>TODO List</title>
      </Head>
      {isLoading && <div>loading...</div>}
      {!isLoading && todoList && (
      <>
        <div>{`TODO #${todoList.length}`}</div>
        <TodoForm />
        <ul>
          {todoList.map((todoItem) => (
            <TodoItem
              key={todoItem.id}
              id={todoItem.id}
              text={todoItem.title}
            />
          ))}
        </ul>
      </>
      )}
    </>
  );
}
