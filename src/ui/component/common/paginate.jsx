// @flow
import React from 'react';
import { withRouter } from 'react-router';
import { Form, FormField } from 'component/common/form';
import ReactPaginate from 'react-paginate';

const PAGINATE_PARAM = 'page';
const ENTER_KEY_CODE = 13;

type Props = {
  loading: boolean,
  totalPages: number,
  location: { search: string },
  history: { push: string => void },
  onPageChange?: number => void,
};

function Paginate(props: Props) {
  const { totalPages, loading, location, history, onPageChange } = props;
  const { search } = location;
  const urlParams = new URLSearchParams(search);
  const currentPage = Number(urlParams.get(PAGINATE_PARAM)) || 1;

  function handleChangePage(newPageNumber: number) {
    if (onPageChange) {
      onPageChange(newPageNumber);
    }

    if (currentPage !== newPageNumber) {
      history.push(`?${PAGINATE_PARAM}=${newPageNumber}`);
    }
  }

  function handlePaginateKeyUp(e: SyntheticKeyboardEvent<*>) {
    const newPage = Number(e.currentTarget.value);
    const isEnterKey = e.keyCode === ENTER_KEY_CODE;

    if (newPage && isEnterKey && newPage > 0 && newPage <= totalPages) {
      handleChangePage(newPage);
    }
  }

  if (totalPages <= 1 || loading) {
    return null;
  }

  return (
    <Form>
      <fieldset-group class="fieldset-group--smushed fieldgroup--paginate">
        <fieldset-section>
          <ReactPaginate
            pageCount={totalPages}
            pageRangeDisplayed={2}
            previousLabel="‹"
            nextLabel="›"
            activeClassName="pagination__item--selected"
            pageClassName="pagination__item"
            previousClassName="pagination__item pagination__item--previous"
            nextClassName="pagination__item pagination__item--next"
            breakClassName="pagination__item pagination__item--break"
            marginPagesDisplayed={2}
            onPageChange={e => handleChangePage(e.selected + 1)}
            forcePage={currentPage - 1}
            initialPage={currentPage - 1}
            containerClassName="pagination"
          />
        </fieldset-section>

        <FormField
          className="paginate-channel"
          onKeyUp={handlePaginateKeyUp}
          label={__('Go to page:')}
          type="text"
          name="paginate-file"
        />
      </fieldset-group>
    </Form>
  );
}

export default withRouter(Paginate);
