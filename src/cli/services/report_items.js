function taskReportItem(taskItem) {
  return {
    id: taskItem.id,
    title: taskItem.title,
    status: taskItem.status,
    workstreams: Array.isArray(taskItem.workstreams) ? taskItem.workstreams : [],
    assignee_id: taskItem.assignee_id || ""
  };
}

function policyReportItem(item) {
  return {
    policy_id: item.policy_id,
    subject_type: item.subject_type,
    subject_id: item.subject_id,
    status: item.status,
    evaluated_at: item.evaluated_at
  };
}

module.exports = {
  policyReportItem,
  taskReportItem
};
