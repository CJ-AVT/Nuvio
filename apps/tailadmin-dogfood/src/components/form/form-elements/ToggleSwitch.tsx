import Switch from "../switch/Switch";
export default function ToggleSwitch() {
  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch is now:", checked ? "ON" : "OFF");
  };
  return (
    <div
      data-rte-id="forms.toggle.card"
      className="bg-slate-50 border border-rose-300 rounded-xl p-6 shadow-md xl:bg-white xl:border xl:border-blue-300 xl:rounded-md xl:p-6 xl:shadow-sm dark:border-gray-800 dark:bg-white/[0.03] hover:border-rose-400 hover:border-rose-400 hover:border-rose-400 hover:border-rose-400"
    >
      <div className="px-6 py-5">
        <h3
          data-rte-id="forms.toggle.title"
          className="text-base font-medium text-rose-600 xl:text-base xl:font-medium xl:text-green-600 dark:text-white/90"
        >
          Toggle switch input
        </h3>
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="flex gap-4">
          <Switch
            label="Default"
            defaultChecked={true}
            onChange={handleSwitchChange}
          />
          <Switch
            label="Checked"
            defaultChecked={true}
            onChange={handleSwitchChange}
          />
          <Switch label="Disabled" disabled={true} />
        </div>
        <div className="mt-4 flex gap-4">
          <Switch
            label="Default"
            defaultChecked={true}
            onChange={handleSwitchChange}
            color="gray"
          />
          <Switch
            label="Checked"
            defaultChecked={true}
            onChange={handleSwitchChange}
            color="gray"
          />
          <Switch label="Disabled" disabled={true} color="gray" />
        </div>
      </div>
    </div>
  );
}
