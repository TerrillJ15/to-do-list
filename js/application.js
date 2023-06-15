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
 * Array of stored row items. Each row item is a @type {Task} object.
 * @type {Task} = { id: number, content: string, completed: boolean, due: datetime, updated_at: datetime, created_at: datetime }
 */
let data = [];

/** The value to filter on. -1 is all and boolean is for the completed state. */
let filter = -1;

/**
 * Called is when the page is loaded.
 * Loads data if previously used.
 * Renders the table.
 */
window.onload = function () {
  renderTable();
  $(document).ready(function () {
    $.ajax({
      type: 'GET',
      url: 'https://fewd-todolist-api.onrender.com/tasks?api_key=215',
      dataType: 'json',
      success: function (response, _textStatus) {
        if (response && response.tasks) {
          data = response.tasks;
        }
        renderTable();
      },
      error: function (_request, _textStatus, errorMessage) {
        alert('Unable to retrieve tasks.');
        console.log(errorMessage);
      },
    });
  });
};

/**
 * Renders the dynamic aspects of the table which includes the data.
 */
function renderTable() {
  renderData();
}

/**
 * Renders all the data matching the current filter as table rows.
 */
function renderData() {
  let displayData = data;
  if (filter !== -1) {
    displayData = data.filter(d => d.completed === filter);
  }
  for (let i = 0; i < displayData.length; i++) {
    renderRow(displayData[i]);
  }
}

/**
 * Renders each row with the proper cells.
 * Each cell is render for it's data value and
 * will be formatted if desired. Each row
 * will have a mark complete and delete button at the end.
 *
 * @param {Task} row Current row with the values.
 */
function renderRow(row) {
  const taskId = `row-${row.id}`;
  $('tbody').append(`<tr id="${taskId}"></tr>`);
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
    <label id="cb-label-${
      row.id
    }-completed" class="checkbox-container" title="${
    row.completed
      ? 'Marked Completed. Click to make active again.'
      : 'Currently Active. Click to mark as complete.'
  }">
      <input id="cb-${row.id}-completed" type="checkbox"${
    row.completed ? ' checked="true"' : ''
  } onclick="toggleCompleted(${row.id})">
      <span class="label"></span>
      <span class="checkbox"></span>
      <span class="checkmark"></span>
    </label>
    <td style="width: 1%">
      <span class="nav-item rounded-pill btn btn-lg btn-outline-danger py-0 px-1 border-0" title="Click to delete.">
        <a
          class="nav-link"
          href="#"
          onclick="deleteRow(${row.id})"
          ><i class="fas fa-trash"></i
        ></a>
      </span>
    </td>
  `);
}

/**
 * Gets the inputs and adds a row when valid.
 * If invalid then the inputs are highlighted red.
 * When an add is successful then inputs are reset.
 */
async function addRow() {
  // get values from the inputs
  const toDo = $('#add-to-do').val();

  // if any of the values are invalid, then do not add
  if (!toDo) {
    $('#row-add > td').css('background-color', 'red');
    return;
  }
  $('#row-add > td').css('background-color', 'white');

  // disable add fields and button until completed
  $('#add-to-do').prop('disabled', true);
  $('#btn-add').addClass('disabled');

  await $.ajax({
    type: 'POST',
    url: 'https://fewd-todolist-api.onrender.com/tasks?api_key=215',
    contentType: 'application/json',
    dataType: 'json',
    data: JSON.stringify({
      task: {
        content: toDo,
      },
    }),
    success: function (response) {
      if (response && response.task) {
        data.push(response.task);
        renderRow(response.task);
        $('#add-to-do').val('');
      }
    },
    error: function (_request, _textStatus, errorMessage) {
      alert('Unable to add the task.');
      console.log(errorMessage);
    },
  });

  // enable add fields and button until completed
  $('#add-to-do').prop('disabled', false);
  $('#btn-add').removeClass('disabled');
}

/**
 * Remove the task for the provided taskId.
 *
 * @param {Number} taskId ID of the task.
 */
function deleteRow(taskId) {
  $.ajax({
    type: 'DELETE',
    url: `https://fewd-todolist-api.onrender.com/tasks/${taskId}?api_key=215`,
    success: function (response) {
      if (response.success) {
        $(`#row-${taskId}`).remove();
        data = data.filter(r => r.id !== taskId);
      }
    },
    error: function (_request, _textStatus, errorMessage) {
      alert('Unable to delete the task.');
      console.log(errorMessage);
    },
  });
}

/**
 * Toggles the completed state for the provided task.
 * Performs a request to change the completed state.
 * Will make sure the rendered task reflects the request state.
 * If a filter is applied, then the task will be removed when the completed state changes.
 *
 * @param {Number} taskId The ID of the task.
 */
function toggleCompleted(taskId) {
  const index = data.findIndex(t => t.id === taskId);
  let task = data[index];
  $.ajax({
    type: 'PUT',
    url: `https://fewd-todolist-api.onrender.com/tasks/${task.id}/${
      task.completed ? 'mark_active' : 'mark_complete' // toggle
    }?api_key=215`,
    dataType: 'json',
    success: function (response, _textStatus) {
      // replace old task with new task
      task = response.task;
      data[index] = task;

      // update the view
      if (filter !== -1 && filter !== task.completed) {
        // if the filter is applied and the state changed, then remove it.
        $(`#row-${task.id}`).remove();
      } else {
        // update button state for task
        $(`#cb-${task.id}-completed`).prop('checked', task.completed);
        $(`#cb-label-${task.id}-completed`).prop(
          'title',
          task.completed
            ? 'Marked Completed. Click to make active again.'
            : 'Currently Active. Click to mark as complete.',
        );
      }
    },
    error: function (_request, _textStatus, errorMessage) {
      alert('Unable to toggle between completed and active.');
      console.log(errorMessage);
    },
  });
}

/**
 * Handles when the selection of the filter toggle is made.
 * Clears the table and rerenders based on the filter.
 *
 * @param {-1 | boolean} val The value of filter on.
 */
function setFilter(val) {
  filter = val;
  $('tbody').empty();
  renderTable();
}
