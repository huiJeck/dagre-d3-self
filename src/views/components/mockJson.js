const data = {
  id: '',
  name: '模板一',
  documentation: '流程基本描述',
  startEvent: {
    id: 'startEvent_1',
    name: '发起者',
    outgoing: 'flow_1_3'
  },
  endEvent: {
    id: 'endEvent_2',
    name: 'END',
    incoming: 'flow_6_2'
  },
  userTasks: [
    {
      id: 'userTask_3',
      name: '节点第二个',
      finished: true,
      unreadable: false,
      type: 'node',
      typeLabel: '审批',
      role: 'role',
      incoming: ['flow_1_3'],
      outgoing: ['flow_3_4'],
      extensionElements: null,
      taskListeners: null,
      assigneeUser: {
        assignee: '${assignee_userTask_68_4}',
        candidateUsers: null,
        candidateGroups: null
      }
    },
    {
      id: 'userTask_4',
      name: '节点3',
      finished: false,
      unreadable: true,
      type: 'node',
      typeLabel: '审批',
      incoming: ['flow_3_4'],
      outgoing: ['flow_4_5'],
      extensionElements: null,
      taskListeners: null,
      assigneeUser: {
        assignee: '${assignee_userTask_68_4}',
        candidateUsers: null,
        candidateGroups: null
      }
    },
    {
      id: 'userTask_5',
      name: '节点4',
      type: 'node',
      typeLabel: '审批',
      incoming: ['flow_4_5'],
      outgoing: ['flow_5_6'],
      extensionElements: null,
      taskListeners: null,
      assigneeUser: {
        assignee: '${assignee_userTask_68_4}',
        candidateUsers: null,
        candidateGroups: null
      }
    },
    {
      id: 'userTask_6',
      name: '节点5',
      type: 'node',
      typeLabel: '审批',
      incoming: ['flow_5_6'],
      outgoing: ['flow_6_2'],
      extensionElements: null,
      taskListeners: null,
      assigneeUser: {
        assignee: '${assignee_userTask_68_4}',
        candidateUsers: null,
        candidateGroups: null
      }
    }
  ],
  sequenceFlows: [
    {
      sourceRef: 'startEvent_1',
      targetRef: 'userTask_3',
      id: 'flow_1_3'
    },
    {
      sourceRef: 'userTask_3',
      targetRef: 'userTask_4',
      id: 'flow_3_4',
      conditionExpression:
        '[发起者][单位(所属单位)] != "长沙综合交通枢纽建设投资有限公司"'
    },
    {
      sourceRef: 'userTask_4',
      targetRef: 'userTask_5',
      id: 'flow_4_5'
    },
    {
      sourceRef: 'userTask_5',
      targetRef: 'userTask_6',
      id: 'flow_5_6'
    },
    {
      sourceRef: 'userTask_6',
      targetRef: 'endEvent_2',
      id: 'flow_6_2'
    }
  ]
}
export default data
