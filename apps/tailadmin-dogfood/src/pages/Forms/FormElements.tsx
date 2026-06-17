export default function FormElements() {
  return (
    <div className="space-y-6">
      <h2
        data-rte-id="form.page.title"
        className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
      >
        Form Elements
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div
            data-rte-id="forms.default.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.default.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Default Inputs
            </h3>
            <label
              htmlFor="email"
              data-rte-id="form.email.label"
              className="mt-4 block text-sm font-medium text-gray-700 xl:text-sm xl:font-normal xl:text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              data-rte-id="form.email.input"
              placeholder="info@gmail.com"
              className="mt-1 w-full text-sm bg-slate-50 border border-rose-300 rounded-xl px-4 py-2 xl:border xl:border-gray-200 xl:rounded-md xl:px-3 xl:py-2"
            />
          </div>
          <div
            data-rte-id="forms.select.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.select.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Select Inputs
            </h3>
          </div>
          <div
            data-rte-id="forms.textarea.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.textarea.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Textarea
            </h3>
          </div>
          <div
            data-rte-id="forms.states.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.states.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Input States
            </h3>
            <p
              data-rte-id="forms.states.desc"
              className="mt-2 text-sm font-normal text-rose-600 xl:text-sm xl:font-normal xl:text-gray-700"
            >
              Validation and disabled states for form fields.
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div
            data-rte-id="forms.inputGroup.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.inputGroup.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Input Group
            </h3>
          </div>
          <div
            data-rte-id="forms.fileInput.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.fileInput.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              File Input
            </h3>
          </div>
          <div
            data-rte-id="forms.checkbox.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.checkbox.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Checkbox
            </h3>
          </div>
          <div
            data-rte-id="forms.radio.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.radio.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Radio Buttons
            </h3>
          </div>
          <div
            data-rte-id="forms.toggle.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.toggle.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Toggle Switch
            </h3>
          </div>
          <div
            data-rte-id="forms.dropzone.card"
            className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-slate-300 xl:rounded-xl xl:p-6 hover:border-rose-400"
          >
            <h3
              data-rte-id="forms.dropzone.title"
              className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600"
            >
              Dropzone
            </h3>
            <p
              data-rte-id="forms.dropzone.hint"
              className="mt-2 text-sm font-normal text-rose-600 xl:text-sm xl:font-normal xl:text-gray-700"
            >
              Drag and drop files here, or click to browse.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
