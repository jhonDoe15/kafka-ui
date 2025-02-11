import React from 'react';
import { KsqlTableResponse } from 'generated-sources';
import TableHeaderCell from 'components/common/table/TableHeaderCell/TableHeaderCell';
import { nanoid } from '@reduxjs/toolkit';
import { TableTitle } from 'components/common/table/TableTitle/TableTitle.styled';

import * as S from './TableRenderer.styled';

export interface Props {
  table: KsqlTableResponse;
}

export function hasJsonStructure(
  str: string | Record<string, unknown>
): boolean {
  if (typeof str === 'object') {
    return true;
  }

  if (typeof str === 'string') {
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
      return false;
    }
  }

  return false;
}

const TableRenderer: React.FC<Props> = ({ table }) => {
  const heading = React.useMemo(() => {
    return table.header || '';
  }, [table.header]);
  const ths = React.useMemo(() => {
    return table.columnNames || [];
  }, [table.columnNames]);
  const rows = React.useMemo(() => {
    return (table.values || []).map((row) => {
      return {
        id: nanoid(),
        cells: row.map((cell) => {
          return {
            id: nanoid(),
            value: hasJsonStructure(cell)
              ? JSON.stringify(cell, null, 2)
              : cell,
          };
        }),
      };
    });
  }, [table.values]);

  return (
    <S.Wrapper>
      <TableTitle>{heading}</TableTitle>
      <S.ScrollableTable>
        <thead>
          <tr>
            {ths.map((th) => (
              <TableHeaderCell title={th} key={th} />
            ))}
          </tr>
        </thead>
        <tbody>
          {ths.length === 0 ? (
            <tr>
              <td colSpan={ths.length}>No tables or streams found</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell) => (
                  <td key={cell.id}>{cell.value}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </S.ScrollableTable>
    </S.Wrapper>
  );
};

export default TableRenderer;
