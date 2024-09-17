var CRMGrid = (function () {
    let gridOptions;
    let currentGridApi;
    let currentTableId;  // Stores the ID of the current table
    const LOCAL_STORAGE_KEY_PREFIX = 'gridColumnPreferences_'; // Prefix for localStorage keys

    function initGrid(gridId, columnDefs, rowData) {
        currentTableId = gridId; // Store the current table ID

        gridOptions = {
            columnDefs: columnDefs,
            rowData: rowData,
            defaultColDef: {
                sortable: true,
                filter: true,
                resizable: true,
            },
            pagination: true,
            paginationPageSize: 10,
            paginationPageSizeSelector: [10, 25, 50, 100],
            rowSelection: 'single',
            animateRows: true,
            onGridReady: function (params) {
                currentGridApi = params.api;
                loadColumnPreferences();
                params.api.sizeColumnsToFit();
            },
            defaultColDef:{
                headerComponent: CustomHeader,
                headerComponentParams: {
                    enableFilterButton: true,
                    enableSorting: true
                }
            },
            onRowClicked: function (event) {
                // Handle row click if needed
            },
            frameworkComponents: {
                // Define custom cell renderers if needed
            },
        };

        const gridDiv = document.querySelector(gridId);
        new agGrid.Grid(gridDiv, gridOptions);
    }

    function getLocalStorageKey() {
        return LOCAL_STORAGE_KEY_PREFIX + currentTableId; // Unique key for each table
    }

    function populateColumnMenu() {
        const columnsList = document.getElementById('columns-list');
        columnsList.innerHTML = ''; // Clear any previous content

        const allColumns = currentGridApi.getColumnDefs();
        allColumns.forEach((colDef, index) => {
            const colCheckbox = `
                <div class="d-flex align-items-center justify-content-start form-check ps-0 w-100 mb-1">
                    <input id="column-${index}" class="form-check form-check-custom form-check-solid form-check-sm ps-0 me-2" type="checkbox" ${colDef.hide ? '' : 'checked'}/>
                    <label class="form-check-label fs-6 fw-semibold" for="column-${index}">
                        ${colDef.headerName}
                    </label>
                </div>
            `;
            columnsList.insertAdjacentHTML('beforeend', colCheckbox);

            // Add event listener to each column checkbox
            document.getElementById(`column-${index}`).addEventListener('change', (e) => {
                const isVisible = e.target.checked;
                currentGridApi.setColumnVisible(colDef.field, isVisible);
            });
        });

        // Select All functionality
        const selectAll = document.getElementById('selectAll');
        selectAll.addEventListener('change', function () {
            const isChecked = this.checked;
            allColumns.forEach((colDef, index) => {
                const checkbox = document.getElementById(`column-${index}`);
                checkbox.checked = isChecked;
                currentGridApi.setColumnVisible(colDef.field, isChecked);
            });
        });
    }

    // Save column preferences to local storage with unique key per table
    function saveColumnPreferences() {
        const allColumns = currentGridApi.getColumnDefs();
        const preferences = allColumns.map(col => ({
            field: col.field,
            hide: col.hide || false
        }));
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(preferences));
    }

    // Load saved column preferences from local storage based on current table
    function loadColumnPreferences() {
        const preferences = JSON.parse(localStorage.getItem(getLocalStorageKey()));
        if (preferences) {
            preferences.forEach(pref => {
                currentGridApi.setColumnVisible(pref.field, !pref.hide);
            });
        }
        populateColumnMenu(); // Re-populate the menu after loading preferences
    }

    // Reset column preferences and make all columns visible
    function resetColumnPreferences() {
        const allColumns = currentGridApi.getColumnDefs();
        allColumns.forEach(colDef => {
            currentGridApi.setColumnVisible(colDef.field, true);
        });
        localStorage.removeItem(getLocalStorageKey()); // Clear preferences from local storage for this table
        populateColumnMenu(); // Re-populate the menu after reset
    }

    // Set up event listeners for Save and Reset buttons
    function setMenuButtons() {
        const saveBtn = document.getElementById('save-preferences');
        saveBtn.addEventListener('click', saveColumnPreferences);

        const resetBtn = document.getElementById('reset-preferences');
        resetBtn.addEventListener('click', resetColumnPreferences);
    }

    return {
        init: function (gridId, columnDefs, rowData) {
            initGrid(gridId, columnDefs, rowData);
            setMenuButtons(); // Set up save/reset buttons
        }
    }
})();


class CustomSetFilter {
    init(params) {
        this.params = params;
        this.filterState = new Set();

        // Create the main container
        this.eGui = document.createElement("div");
        this.eGui.classList.add('menu', 'menu-sub', 'menu-sub-dropdown', 'd-block', 'w-250px', 'p-6');
        this.eGui.style.fontFamily = '"IBM Plex Sans", sans-serif';

        // Create the "Select All" checkbox
        let checkboxesHtml = `
            <div class="d-flex align-items-center justify-content-start form-check ps-0 w-100 mb-1">
                <input id="selectAll" class="form-check form-check-custom form-check-solid form-check-sm ps-0 me-2" type="checkbox" checked/>
                <label class="form-check-label fs-6 fw-semibold" for="selectAll">
                    (Select All)
                </label>
            </div>
            <div class="d-flex align-items-center justify-content-start form-check ps-0 w-100 mb-1">
                <input id="blank" class="form-check form-check-custom form-check-solid form-check-sm ps-0 me-2" type="checkbox" value="" checked />
                <label class="form-check-label fs-6 fw-semibold text-truncate" for="blank">
                    (Blanks)
                </label>
            </div>
        `;

        // Populate the checkboxes from the data
        params.api.forEachNode(node => {
            let fieldValue = node.data[params.colDef.field];
            if (fieldValue && !this.filterState.has(fieldValue)) {
                this.filterState.add(fieldValue);
                checkboxesHtml += `
                    <div class="form-check d-flex align-items-center ps-0 w-100 checkbox-item mb-1">
                        <input id="${fieldValue}" class="form-check form-check-custom form-check-solid form-check-sm ps-0 me-2" type="checkbox" value="${fieldValue}" checked />
                        <label class="form-check-label fs-6 fw-semibold text-truncate" for="${fieldValue}">${fieldValue}</label>
                    </div>
                `;
            }
        });

        this.eGui.innerHTML = `
            <div class="d-flex align-items-center position-relative m-0 mb-4">
                <span class="svg-icon position-absolute ms-4">
                    <i class="ki-duotone ki-magnifier fs-5">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </i>
                </span>
                <input id="selectSearch" type="text" data-table-filter="search" class="form-control form-control-sm w-100 ps-11 py-0" placeholder="Search....">
            </div>
            ${checkboxesHtml}
        `;

        // Attach event listeners
        this.eGui.querySelector('#selectSearch').addEventListener('input', event => {
            this.filterCheckboxes(event.target.value);
        });

        this.eGui.querySelector('#selectAll').addEventListener('change', event => {
            this.toggleAllCheckboxes(event.target.checked);
        });

        this.eGui.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.addEventListener('change', () => {
                if (input.id === 'selectAll') {
                    if (input.checked) 
                        this.toggleAllCheckboxes(input.checked);
                }
                else {
                    if (input.checked) 
                        this.filterState.add(input.value);
                    else
                        this.filterState.delete(input.value);
                    this.updateSelectAllCheckbox();
                }
                this.updateFilter();
            });
        });
    }

    getGui(){
        return this.eGui;
    }

    updateFilter() {
        this.params.filterChangedCallback();
    }

    isFilterActive(){
        return this.filterState.size >= 0;
    }

    doesFilterPass(params){
        let { field } = this.params.colDef;
        console.log(this.filterState.length)
        if (this.filterState.size === 0)
            return false;
        
        return this.filterState.has(params.data[field]);
    }

    filterCheckboxes(searchValue) {
        searchValue = searchValue.toLowerCase();
        this.eGui.querySelectorAll('.checkbox-item').forEach(item => {
            let checkboxLabel = item.querySelector('label').textContent.toLowerCase();
            if (checkboxLabel.includes(searchValue)) {
                item.classList.remove('d-none');
            } else {
                item.classList.add('d-none');
            }
        });
    }

    toggleAllCheckboxes(checked) {
        this.eGui.querySelectorAll('input[type="checkbox"]').forEach(input => {
            if (input.id !== 'selectAll') {
                input.checked = checked;
                if (checked) {
                    this.filterState.add(input.value);
                } else {
                    this.filterState.delete(input.value);
                }
            }
        });
        this.updateFilter();
        console.log(this.filterState)
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = this.eGui.querySelector('#selectAll');
        const allCheckboxes = Array.from(this.eGui.querySelectorAll('input[type="checkbox"]')).filter(input => input.id !== 'selectAll');
        const checkedCheckboxes = allCheckboxes.filter(input => input.checked);

        if (checkedCheckboxes.length === allCheckboxes.length) {
            // All checkboxes are checked
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCheckboxes.length > 0) {
            // Some checkboxes are checked
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        } else {
            // No checkboxes are checked
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        }
    }
}

class CustomDateFilter {
    init(params) {
        this.params = params;
        this.filterState = new Set();

        // Create the main container
        this.eGui = document.createElement("div");
        this.eGui.classList.add('menu', 'menu-sub', 'menu-sub-dropdown', 'd-block', 'w-250px', 'p-6');
        this.eGui.style.fontFamily = '"IBM Plex Sans", sans-serif';

        // Initial HTML structure
        this.eGui.innerHTML = `
            <select id="selectFilter" class="form-select form-select-sm fw-bold select2-hidden-accessible mb-4" data-kt-select2="true" data-hide-search="true" tabindex="-10" aria-hidden="true">
                <option value="equal" selected>Equals</option>
                <option value="notEqual">Does not equal</option>
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="between">Between</option>
                <option value="blank">Blank</option>
                <option value="notBlank">Not blank</option>
            </select>
            <div id="dateInputContainer1" class="position-relative d-flex align-items-center mb-3">
                <span class="svg-icon svg-icon-5 position-absolute mx-4">
                    <i class="ki-duotone ki-calendar">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </i>
                </span>
                <input id="dateInput1" class="form-control form-control-sm ps-12 flatpickr-input" name="org_establishment" type="text" readonly="readonly" placeholder="Start Date">
            </div>
            <div id="dateInputContainer2" class="position-relative d-flex align-items-center d-none">
                <span class="svg-icon svg-icon-5 position-absolute mx-4">
                    <i class="ki-duotone ki-calendar">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </i>
                </span>
                <input id="dateInput2" class="form-control form-control-sm ps-12 flatpickr-input" name="org_establishment" type="text" readonly="readonly" placeholder="End Date">
            </div>
        `;

        // Initialize Select2
        this.dropdownElement = $(this.eGui.querySelector('#selectFilter'));
        this.dropdownElement.select2({
            minimumResultsForSearch: Infinity
        });

        // Initialize Flatpickr
        this.dateSelector1 = $(this.eGui.querySelector('#dateInput1'));
        this.dateSelector2 = $(this.eGui.querySelector('#dateInput2'));

        this.dateSelector1.flatpickr({
            dateFormat: "d M, Y",
            allowInput: true,
            onChange: () => {
                console.log('DateInput1 changed');
                this.params.filterChangedCallback();
            }
        });

        this.dateSelector2.flatpickr({
            dateFormat: "d M, Y",
            allowInput: true,
            onChange: () => {
                console.log('DateInput2 changed');
                this.params.filterChangedCallback();
            }
        });

        this.eGui.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        // Set up event listeners
        this.dropdownElement.on('select2:select', (e) => {
            this.filterCondition = e.params.data.id;
            console.log(this.filterCondition)
            this.updateDateInputsVisibility();
            this.params.filterChangedCallback();
        });
    }

    getGui() {
        return this.eGui;
    }

    updateDateInputsVisibility() {
        const isBetween = this.filterCondition === 'between';
        this.eGui.querySelector('#dateInputContainer2').classList.toggle('d-none', !isBetween);
    }

    doesFilterPass(params) {
        const { colDef } = this.params;
        const fieldValue = params.data[colDef.field];
        const filterValue1 = this.dateSelector1.flatpickr().selectedDates[0];
        const filterValue2 = this.dateSelector2.flatpickr().selectedDates[0];

        console.log('Field Value:', fieldValue);
        console.log('Filter Start Date:', filterValue1);
        console.log('Filter End Date:', filterValue2);

        // Convert date strings to Date objects if they are not already
        const fieldDate = new Date(fieldValue);
        const startDate = filterValue1 ? new Date(filterValue1) : null;
        const endDate = filterValue2 ? new Date(filterValue2) : null;

        console.log('Parsed Field Date:', fieldDate);
        console.log('Parsed Start Date:', startDate);
        console.log('Parsed End Date:', endDate);

        if(this.filterCondition == 'blank'){
            return !fieldValue || fieldValue.trim() === '';
        } 
        else if(this.filterCondition == 'notBlank'){
            return fieldValue && fieldValue.trim() !== '';
        }
        else if(this.filterCondition == 'between' && startDate && endDate)
            return (startDate ? fieldDate >= startDate : true) && (endDate ? fieldDate <= endDate : true);
        else{
            switch (this.filterCondition) {
                case 'equal':
                    return startDate ? fieldDate.toDateString() === startDate.toDateString() : false;
                case 'notEqual':
                    return startDate ? fieldDate.toDateString() !== startDate.toDateString() : true;
                case 'before':
                    return startDate ? fieldDate < startDate : false;
                case 'after':
                    return startDate ? fieldDate > startDate : false;                
                default:
                    return true;
            }
        }
    }

    isFilterActive() {
        return true;
        // return this.filterCondition && (this.filterCondition !== 'blank' && this.filterCondition !== 'notBlank' || (this.filterValue1 || this.filterValue2));
    }
}

class CustomTextFilter {
    init(params) {
        this.params = params;
        this.filterValue = null;
        this.filterCondition = 'contains'; // Default filter condition

        // Create the filter GUI with dropdown and input field
        this.eGui = document.createElement('div');
        this.eGui.classList.add('menu', 'menu-sub', 'menu-sub-dropdown', 'd-block', 'w-250px', 'p-4');
        this.eGui.style.fontFamily = '"IBM Plex Sans", sans-serif';

        this.eGui.innerHTML = `
            <select id="selectFilter" class="form-select form-select-sm fw-bold select2-hidden-accessible mb-4" data-kt-select2="true" data-hide-search="true" tabindex="-10" aria-hidden="true">
                <option value="contains"selected>Contains</option>
                <option value="notContains">Does not contains</option>
                <option value="equals">Equals</option>
                <option value="notEqual">Does not equal</option>
                <option value="beginsWith">Begins with</option>
                <option value="endsWith">Ends with</option>
                <option value="blank">Blank</option>
                <option value="notBlank">Not blank</option>
            </select>
            <div class="d-flex align-items-center position-relative m-0">
                <span class="svg-icon position-absolute ms-4">
                    <i class="ki-duotone ki-magnifier fs-5">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </i>
                </span>
                <input id="selectSearch" type="text" data-table-filter="search" class="form-control form-control-sm w-100 ps-11 py-0" placeholder="Search....">
            </div>
        `;

        this.dropdownElement = $(this.eGui.querySelector('#selectFilter'));

        this.dropdownElement.select2({
            minimumResultsForSearch: Infinity
        });

        // Access the elements
        this.inputElement = this.eGui.querySelector('#selectSearch');
        const self = this;

        this.inputElement.addEventListener('input', event => {
            this.filterValue = event.target.value;
            console.log(this.filterValue)
            params.filterChangedCallback();
        });

        this.dropdownElement.on('select2:select', function (e) {
            self.filterCondition = e.params.data.id;
            console.log(self.filterCondition)
            params.filterChangedCallback();
        });

    }

    getGui() {
        return this.eGui;
    }

    doesFilterPass(params) {
        const { api, colDef, column, columnApi, context } = this.params;
        const fieldValue = params.data[colDef.field].toString().toLowerCase();
        const filterValue = this.filterValue ? this.filterValue.toLowerCase() : '';
        
        console.log(this.filterCondition)
        switch (this.filterCondition) {
            case 'contains':
                return fieldValue.includes(filterValue);
            case 'notContains':
                return !fieldValue.includes(filterValue);
            case 'equals':
                return fieldValue === filterValue;
            case 'notEqual':
                return fieldValue !== filterValue;
            case 'beginsWith':
                return fieldValue.startsWith(filterValue);
            case 'endsWith':
                return fieldValue.endsWith(filterValue);
            case 'blank':
                return fieldValue == '';
            case 'notBlank':
                return fieldValue != ''; 
        }
    }

    isFilterActive() {
        return this.filterValue && this.filterValue !== '';
    }
}

class CustomHeader {
    agParams;
    eGui;
    eFilterMenuButton;
    eSortDownButton;
    eSortUpButton;
    eSortRemoveButton;
    onMenuClickListener;
    onSortAscRequestedListener;
    onSortDescRequestedListener;
    onRemoveSortListener;
    onSortChangedListener;

    init(agParams) {
        this.agParams = agParams;
        this.eGui = document.createElement('div');
        this.eGui.classList.add('d-flex', 'align-items-center', 'justify-content-between', 'px-0', 'py-2', 'custom-header', 'w-100')
        this.eGui.innerHTML = `
            <div class="d-flex align-items-center float-start">
                <div class="btn btn-icon btn-custom btn-icon-muted text-hover-gray-900 btn-active-text-gray-900 w-20px h-25px p-1 d-flex flex-column sort-icons">
                    <i class="bi bi-caret-up-fill asc-icon opacity-25 fs-7"></i>
                    <i class="bi bi-caret-down-fill desc-icon opacity-25 fs-7"></i>
                </div>
                <div class="header-lable ms-1">${this.agParams.displayName}</div>
            </div>
            <button class="btn btn-icon btn-custom btn-icon-muted text-hover-gray-900 btn-active-text-gray-900 w-20px h-25px filter-button p-2 float-end">
                <i class="ki-duotone ki-filter fs-4" >
                    <span class="path1"></span>
                    <span class="path2"></span>
                </i>
            </button>
        `;

        this.eSortIcons = this.eGui.querySelector('.sort-icons');
        this.eFilterMenuButton = this.eGui.querySelector('.filter-button');
        this.eSortDownButton = this.eGui.querySelector('.asc-icon');
        this.eSortUpButton = this.eGui.querySelector('.desc-icon');

        // Set up event listeners
        if (this.agParams.enableFilterButton) {
            this.onMenuClickListener = this.onMenuClick.bind(this);
            this.eFilterMenuButton.addEventListener('click', this.onMenuClickListener);
        }

        if (this.agParams.enableSorting) {
            this.onSortIconsClickListener = this.onSortIconsClick.bind(this);
            this.eSortIcons.addEventListener('click', this.onSortIconsClickListener);

            this.onSortChangedListener = this.onSortChanged.bind(this);
            this.agParams.api.addEventListener('sortChanged', this.onSortChangedListener);
            this.onSortChanged();
        }

        // Ensure icons are always displayed
        this.eSortDownButton.classList.add('opacity-25');
        this.eSortUpButton.classList.add('opacity-25');
    }

    onSortIconsClick() {
        const currentSort = this.agParams.column.getSort();

        if (currentSort === 'asc') {
            this.onSortRequested('desc');
        } else if (currentSort === 'desc') {
            this.onSortRequested(null); // No sort
        } else {
            this.onSortRequested('asc');
        }
    }

    onSortChanged() {
        const deactivate = (icons) => {
            icons.forEach((icon) => {
                icon.classList.add('opacity-25');
                icon.classList.remove('opacity-100');
            });
        };

        const activate = (icon) => {
            icon.classList.add('opacity-100');
            icon.classList.remove('opacity-25');
        };

        const sort = this.agParams.column.getSort();

        if (sort === 'asc') {
            deactivate([this.eSortDownButton]);
            activate(this.eSortUpButton);
        } else if (sort === 'desc') {
            deactivate([this.eSortUpButton]);
            activate(this.eSortDownButton);
        } else {
            deactivate([this.eSortUpButton, this.eSortDownButton]);
        }
    }

    onMenuClick() {
        this.agParams.showColumnMenu(this.eFilterMenuButton);
    }

    getGui() {
        return this.eGui;
    }

    refresh(params) {
        this.agParams = params;
        this.eGui.querySelector('.customHeaderLabel').textContent = params.displayName;
        this.onSortChanged();
        return true;
    }

    onSortRequested(order) {
        this.agParams.setSort(order);
    }

    destroy() {
        if (this.onMenuClickListener) {
            this.eFilterMenuButton.removeEventListener('click', this.onMenuClickListener);
        }
        this.eSortDownButton.removeEventListener('click', this.onSortAscRequestedListener);
        this.eSortUpButton.removeEventListener('click', this.onSortDescRequestedListener);
        this.agParams.column.removeEventListener('sortChanged', this.onSortChangedListener);
    }
}


class CustomPagination {
    init(params) {
        this.params = params;

        // Create the pagination container with Bootstrap classes
        this.eGui = document.createElement('nav');
        this.eGui.classList.add('d-flex', 'justify-content-center', 'mt-3');

        // Initialize current page and total pages
        this.currentPage = parseInt(localStorage.getItem('currentPage')) || 0;
        this.totalPages = Math.ceil(params.api.paginationGetRowCount() / params.api.paginationGetPageSize());

        // Render the pagination UI
        this.updatePaginationUI();
    }

    // Function to render pagination buttons
    updatePaginationUI() {
        // Clear existing pagination UI
        this.eGui.innerHTML = '';

        // Create pagination controls with Bootstrap
        const ul = document.createElement('ul');
        ul.classList.add('pagination');

        // Create 'First', 'Prev', 'Next', 'Last' buttons
        ul.appendChild(this.createPageItem('First', 0));
        ul.appendChild(this.createPageItem('Prev', this.currentPage - 1));

        // Display current page info
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item', 'disabled');
        const pageLink = document.createElement('span');
        pageLink.classList.add('page-link');
        pageLink.textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
        pageItem.appendChild(pageLink);
        ul.appendChild(pageItem);

        // Create 'Next', 'Last' buttons
        ul.appendChild(this.createPageItem('Next', this.currentPage + 1));
        ul.appendChild(this.createPageItem('Last', this.totalPages - 1));

        // Append to container
        this.eGui.appendChild(ul);
    }

    // Function to create Bootstrap pagination items
    createPageItem(label, targetPage) {
        const li = document.createElement('li');
        li.classList.add('page-item');

        // Disable 'Prev' or 'First' if on the first page, and 'Next' or 'Last' if on the last page
        if (label === 'Prev' && this.currentPage === 0 || label === 'First' && this.currentPage === 0) {
            li.classList.add('disabled');
        } else if (label === 'Next' && this.currentPage === this.totalPages - 1 || label === 'Last' && this.currentPage === this.totalPages - 1) {
            li.classList.add('disabled');
        }

        const button = document.createElement('button');
        button.classList.add('page-link');
        button.textContent = label;

        button.addEventListener('click', () => this.goToPage(targetPage));
        li.appendChild(button);

        return li;
    }

    // Handle page navigation
    goToPage(page) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.params.api.paginationGoToPage(page);

            // Save the current page to localStorage
            localStorage.setItem('currentPage', page);

            // Update the pagination UI
            this.updatePaginationUI();
        }
    }

    // Required by AG Grid
    getGui() {
        return this.eGui;
    }

    // Required by AG Grid to destroy the component
    destroy() {
        this.eGui.remove();
    }
}


