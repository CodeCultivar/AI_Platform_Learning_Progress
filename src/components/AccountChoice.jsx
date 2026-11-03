export default function AccountChoice({ user, onMerge, onFresh, onCancel }) {
  return (
    <div className="modal-back top">
      <div className="modal card" role="alertdialog" aria-modal="true" aria-label="Different account">
        <h2 style={{ marginTop: 0 }}>This browser has progress from another account</h2>
        <p>You signed in as <b>{user.email}</b>, but the progress saved in this browser was last synced with a different Google account. Nothing has been uploaded yet. What should happen to it?</p>
        <ul className="plain">
          <li><b>Start fresh</b> clears this browser's local copy, then loads your account's saved progress. Choose this on a shared computer.</li>
          <li><b>Merge it into my account</b> uploads it to your account. Choose this only if that progress is yours.</li>
        </ul>
        <div className="modal-actions">
          <button className="btn" onClick={onFresh}>Start fresh</button>
          <button onClick={onMerge}>Merge it into my account</button>
          <button onClick={onCancel}>Sign out</button>
        </div>
      </div>
    </div>
  )
}
