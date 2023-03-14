import React from 'react';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { dehydrate, QueryClient, useQuery } from 'react-query';

import logger from '@/logger';

import { QUERY_KEY } from '@/constants/index';
import { getTodos } from '@/services/index';

import TodoForm from '@/components/TodoForm';
import TodoItem from '@/components/TodoItem';

export const getServerSideProps: GetServerSideProps = async () => {
  logger.info(`server env >> ${process.env.SERVER_VAR_1}`);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(QUERY_KEY.GET_TODOS, getTodos);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default function Home() {
  const {
    isLoading: isTodoLoading,
    data: todoList,
  } = useQuery(
    QUERY_KEY.GET_TODOS,
    getTodos,
    { staleTime: 60 * 1000 },
  );

  logger.info(`client env >> ${process.env.NEXT_PUBLIC_VAR_1}`);

  return (
    <>
      <Head>
        <title>TODO List</title>
      </Head>
      {isTodoLoading && <div>loading...</div>}
      {!isTodoLoading && todoList && (
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
