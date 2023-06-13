/**
 * The array of column objects.
 */
const COLUMNS = [
  {
    title: 'To-Do',
    value: 'content',
  },
];

/**
 * Array of stored row items. Each row item is a @type {Row} object.
 */
let data = [
  {
    id: 0,
    content: 'Test 1',
    completed: false,
  },
  {
    id: 1,
    content: 'Test 2',
    completed: true,
  },
];

/**
 * Called is when the page is loaded.
 * Loads data if previously used.
 * Renders the table.
 */
window.onload = function () {
  const storeData = window.localStorage.getItem('to-do-list');
  if (storeData) {
    data = JSON.parse(storeData);
  }
  renderTable();
};

/**
 * Renders the dynamic aspects of the table which includes the data and footer tables.
 */
function renderTable() {
  renderData();
}

/**
 * Renders all the data as table rows.
 */
function renderData() {
  for (let i = 0; i < data.length; i++) {
    renderRow(data[i]);
  }
}

/**
 * Renders each row with the proper cells.
 * Each cell is render for it's data value and
 * will be formatted if desired. Each row
 * will have a mark complete and delete button at the end.
 *
 * @param {Row} row Current row with the values.
 */
function renderRow(row) {
  const rowId = `row-${row.id}`;
  $('tbody').append(`<tr id="${rowId}"></tr>`);
  for (let i = 0; i < COLUMNS.length; i++) {
    $(`#row-${row.id}`).append(
      `<td id="cell-${row.id}-${COLUMNS[i].value}" class="${
        COLUMNS[i].value
      }">${
        // data value; use format function if provided, otherwise return data as is
        COLUMNS[i].format
          ? COLUMNS[i].format(row, [COLUMNS[i].value])
          : row[COLUMNS[i].value] ?? ''
      }</td>`,
    );
  }
  $(`#row-${row.id}`).append(`
    <td style="width: 1%">
        <button
            id="cell-${row.id}-completed"
            type="button"
            class="btn btn-sm btn-primary"
            onclick="toggleCompleted(${row.id})"
        >
            Mark&nbsp;Complete
        </button>
    </td>
    <td style="width: 1%">
        <button
            id="cell-${row.id}-delete"
            type="button"
            class="btn btn-sm btn-danger"
            onclick="deleteRow(${row.id})"
        >
            Delete
        </button>
    </td>
  `);
}

/**
 * Gets the inputs and adds a row when valid.
 * If invalid then the inputs are highlighted red.
 * When an add is successful then inputs are reset.
 */
function addRow() {
  // get values from the inputs
  const toDo = $('#add-to-do').val();

  // if any of the values are invalid, then do not add
  if (!toDo) {
    $('#row-add > td').css('background-color', 'red');
    return;
  }
  $('#row-add > td').css('background-color', 'white');

  const row = {
    id: Date.now(),
    content: toDo,
    completed: false,
  };
  data.push(row);
  renderRow(row);
  updateStoredData();

  $('#add-to-do').val('');
}

/**
 * Remove the row for the provided rowId.
 *
 * @param {Number} rowId ID of the row.
 */
function deleteRow(rowId) {
  $(`#row-${rowId}`).remove();
  data = data.filter(r => r.id !== rowId);
  updateStoredData();
}

/**
 * Updates the data in the local storage.
 */
function updateStoredData() {
  window.localStorage.setItem('to-do-list', JSON.stringify(data));
}
