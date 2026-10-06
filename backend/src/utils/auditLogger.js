const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

const recordAudit = async ({
  req,
  user,
  action,
  module: modName,
  entityType,
  entityId,
  documentNumber = null,
  before = null,
  after = null,
  remarks = null
}) => {
  try {
    const actorUser = user || (req && req.user);
    const ip = req ? req.ip || req.headers['x-forwarded-for'] : null;
    const userAgent = req ? req.headers['user-agent'] : null;

    await AuditLog.create({
      user: actorUser ? actorUser._id : null,
      userEmail: actorUser ? actorUser.email : null,
      role: actorUser ? actorUser.role : null,
      action,
      module: modName,
      entityType,
      entityId,
      documentNumber,
      before,
      after,
      ip,
      userAgent,
      remarks
    });
  } catch (error) {
    logger.error(`Failed to record audit log: ${error.message}`);
  }
};

module.exports = { recordAudit };
