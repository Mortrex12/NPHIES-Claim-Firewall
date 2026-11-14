"""
NPHIES Claim Firewall - REST API & Web Server
==============================================
Track 2: Healthcare Digital Transformation - Medathon

Provides:
- POST /api/v1/validate: 15-rule verification + AI denial prediction + SHAP
- POST /api/v1/autofix: One-click rule auto-fixer
- POST /api/v1/nphies-proxy: Inline proxy simulator to NPHIES gateway
- GET  /api/v1/samples: Pre-loaded synthetic FHIR R4 claims
- Serves the built UI at http://localhost:5000
"""

import os
from flask import Flask, request, jsonify, send_from_directory
from engine.firewall import check_rules, evaluate_ai_denial_risk, apply_auto_fix
from engine.synthetic_claims import SAMPLE_CLAIMS

STATIC_DIR = os.path.join(os.path.dirname(__file__), 'nphies-firewall-ui', 'dist')
app = Flask(__name__, static_folder=STATIC_DIR, static_url_path='')

@app.route('/api/v1/samples', methods=['GET'])
def get_samples():
    """Return preloaded synthetic FHIR R4 claims."""
    return jsonify({
        "status": "success",
        "count": len(SAMPLE_CLAIMS),
        "claims": SAMPLE_CLAIMS
    })

@app.route('/api/v1/validate', methods=['POST'])
def validate_claim():
    """Run 15 deterministic rules + AI denial risk engine."""
    claim = request.get_json(force=True)
    if not claim:
        return jsonify({"error": "No claim JSON provided"}), 400

    rule_results = check_rules(claim)
    failed_count = sum(1 for r in rule_results if not r["passed"])
    ai_risk = evaluate_ai_denial_risk(claim, failed_count)

    return jsonify({
        "status": "success",
        "claimId": claim.get("id"),
        "verdict": ai_risk["verdict"],
        "verdictAr": ai_risk["verdictAr"],
        "verdictEn": ai_risk["verdictEn"],
        "sarAtRisk": ai_risk["sarAtRisk"],
        "denialRiskScore": ai_risk["denialRiskScore"],
        "threshold": ai_risk["threshold"],
        "rulesSummary": {
            "total": len(rule_results),
            "passed": len(rule_results) - failed_count,
            "failed": failed_count
        },
        "ruleResults": rule_results,
        "shapFactors": ai_risk["shapFactors"],
        "recommendationAr": ai_risk["recommendationAr"],
        "recommendationEn": ai_risk["recommendationEn"]
    })

@app.route('/api/v1/autofix', methods=['POST'])
def autofix_claim():
    """Apply deterministic 1-click auto-fix to claim."""
    claim = request.get_json(force=True)
    if not claim:
        return jsonify({"error": "No claim JSON provided"}), 400

    fixed_claim, fixes = apply_auto_fix(claim)
    new_rule_results = check_rules(fixed_claim)
    new_failed_count = sum(1 for r in new_rule_results if not r["passed"])
    new_ai_risk = evaluate_ai_denial_risk(fixed_claim, new_failed_count)

    return jsonify({
        "status": "success",
        "fixedClaim": fixed_claim,
        "fixesApplied": fixes,
        "newVerdict": new_ai_risk["verdict"],
        "newSarAtRisk": new_ai_risk["sarAtRisk"],
        "newRulesSummary": {
            "total": len(new_rule_results),
            "passed": len(new_rule_results) - new_failed_count,
            "failed": new_failed_count
        }
    })

@app.route('/api/v1/nphies-proxy', methods=['POST'])
def nphies_proxy():
    """Simulate transparent inline proxy submission to NPHIES."""
    claim = request.get_json(force=True)
    rule_results = check_rules(claim)
    failed_count = sum(1 for r in rule_results if not r["passed"])

    if failed_count > 0:
        return jsonify({
            "status": "BLOCKED_BY_FIREWALL",
            "message": "NPHIES Claim Firewall blocked transmission due to deterministic rule failures.",
            "violations": [r["nameAr"] for r in rule_results if not r["passed"]]
        }), 422

    # If clean, forward and simulate NPHIES ClaimResponse
    import random, string
    nphies_ack = "NPH-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return jsonify({
        "status": "NPHIES_SUBMISSION_SUCCESS",
        "httpStatus": 200,
        "nphiesAcknowledgment": nphies_ack,
        "outcome": "Claim accepted by NPHIES gateway, routed to payer for adjudication.",
        "feedbackLoopUpdated": True
    })

# Serve Frontend Static Assets
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    print("=============================================================")
    print("  NPHIES Claim Firewall - Hackathon Prototype Server (Active) ")
    print("  Track 2: Healthcare Digital Transformation · Medathon 2026 ")
    print("  URL: http://localhost:5000                                 ")
    print("=============================================================")
    app.run(host='0.0.0.0', port=5000, debug=False)
