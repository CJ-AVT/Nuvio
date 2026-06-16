export function ConditionalFixture({ show }: { show: boolean }) {
  return (
    <div data-rte-id="promo.shell" className="rounded-xl border p-4">
      {show ? (
        <p data-rte-id="promo.message" className="text-sm text-gray-700">
          Limited-time offer
        </p>
      ) : (
        <p data-rte-id="promo.message.alt" className="text-sm text-gray-500">
          Offer hidden
        </p>
      )}
    </div>
  );
}
