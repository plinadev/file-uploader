function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <span className="loading loading-infinity w-15 bg-[var(--color-logo-yellow)]"></span>
    </div>
  );
}

export default Loader;
