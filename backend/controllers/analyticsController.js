const db = require('../db/database');

/**
 * GET /api/analytics/village-risk
 * Returns per-village disease case counts + risk level
 */
exports.getVillageRisk = (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT 
        vr.village,
        vr.disease,
        SUM(vr.case_count) as total_cases,
        MAX(vr.recorded_at) as last_recorded
      FROM village_health_reports vr
      GROUP BY vr.village, vr.disease
      ORDER BY vr.village ASC, total_cases DESC
    `).all();

    // Group by village
    const villagemap = {};
    for (const row of rows) {
      if (!villagemap[row.village]) {
        villagemap[row.village] = { village: row.village, diseases: [], total: 0 };
      }
      villagemap[row.village].diseases.push({ disease: row.disease, cases: row.total_cases, last: row.last_recorded });
      villagemap[row.village].total += row.total_cases;
    }

    const result = Object.values(villagemap).map(v => ({
      ...v,
      risk: v.total >= 40 ? 'high' : v.total >= 20 ? 'medium' : 'low'
    })).sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/disease-trend
 * Global top diseases across all villages
 */
exports.getDiseaseTrend = (req, res, next) => {
  try {
    const rows = db.prepare(`
      SELECT disease, SUM(case_count) as total_cases
      FROM village_health_reports
      GROUP BY disease
      ORDER BY total_cases DESC
    `).all();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/analytics/summary
 * Top-level numbers for KPI cards
 */
exports.getSummary = (req, res, next) => {
  try {
    const totalCases  = db.prepare('SELECT SUM(case_count) as v FROM village_health_reports').get()?.v || 0;
    const villageCount = db.prepare('SELECT COUNT(DISTINCT village) as v FROM village_health_reports').get()?.v || 0;
    const diseaseCount = db.prepare('SELECT COUNT(DISTINCT disease) as v FROM village_health_reports').get()?.v || 0;
    const highRisk     = db.prepare(`
      SELECT COUNT(*) as v FROM (
        SELECT village, SUM(case_count) as t FROM village_health_reports GROUP BY village HAVING t >= 40
      )
    `).get()?.v || 0;

    res.json({ totalCases, villageCount, diseaseCount, highRisk });
  } catch (err) {
    next(err);
  }
};
