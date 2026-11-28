import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error(error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="page-fallback" role="alert">
        <h2>Une erreur inattendue est survenue.</h2>
        <button className="btn-add" onClick={() => window.location.assign('/')}>Retour à l'accueil</button>
      </div>
    );
  }
}
