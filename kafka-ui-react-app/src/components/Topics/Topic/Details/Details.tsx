import React from 'react';
import { ClusterName, TopicName } from 'redux/interfaces';
import {
  NavLink,
  Switch,
  Route,
  useHistory,
  useParams,
} from 'react-router-dom';
import {
  clusterTopicSettingsPath,
  clusterTopicPath,
  clusterTopicMessagesPath,
  clusterTopicsPath,
  clusterTopicConsumerGroupsPath,
  clusterTopicEditPath,
  clusterTopicSendMessagePath,
  RouteParamsClusterTopic,
} from 'lib/paths';
import ClusterContext from 'components/contexts/ClusterContext';
import ConfirmationModal from 'components/common/ConfirmationModal/ConfirmationModal';
import { useDispatch } from 'react-redux';
import { deleteTopicAction } from 'redux/actions';
import PageHeading from 'components/common/PageHeading/PageHeading';
import { Button } from 'components/common/Button/Button';
import Dropdown from 'components/common/Dropdown/Dropdown';
import VerticalElipsisIcon from 'components/common/Icons/VerticalElipsisIcon';
import DropdownItem from 'components/common/Dropdown/DropdownItem';
import styled from 'styled-components';
import Navbar from 'components/common/Navigation/Navbar.styled';
import * as S from 'components/Topics/Topic/Details/Details.styled';
import { useAppSelector } from 'lib/hooks/redux';
import {
  getIsTopicDeletePolicy,
  getIsTopicInternal,
} from 'redux/reducers/topics/selectors';

import OverviewContainer from './Overview/OverviewContainer';
import TopicConsumerGroupsContainer from './ConsumerGroups/TopicConsumerGroupsContainer';
import SettingsContainer from './Settings/SettingsContainer';
import Messages from './Messages/Messages';

interface Props {
  isDeleted: boolean;
  deleteTopic: (clusterName: ClusterName, topicName: TopicName) => void;
  recreateTopic: (clusterName: ClusterName, topicName: TopicName) => void;
  clearTopicMessages(params: {
    clusterName: ClusterName;
    topicName: TopicName;
  }): void;
}

const HeaderControlsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-self: center;
  gap: 26px;
`;

const Details: React.FC<Props> = ({
  isDeleted,
  deleteTopic,
  recreateTopic,
  clearTopicMessages,
}) => {
  const { clusterName, topicName } = useParams<RouteParamsClusterTopic>();

  const isInternal = useAppSelector((state) =>
    getIsTopicInternal(state, topicName)
  );

  const isDeletePolicy = useAppSelector((state) =>
    getIsTopicDeletePolicy(state, topicName)
  );

  const history = useHistory();
  const dispatch = useDispatch();
  const { isReadOnly, isTopicDeletionAllowed } =
    React.useContext(ClusterContext);
  const [isDeleteTopicConfirmationVisible, setDeleteTopicConfirmationVisible] =
    React.useState(false);
  const [isClearTopicConfirmationVisible, setClearTopicConfirmationVisible] =
    React.useState(false);
  const [
    isRecreateTopicConfirmationVisible,
    setRecreateTopicConfirmationVisible,
  ] = React.useState(false);
  const deleteTopicHandler = React.useCallback(() => {
    deleteTopic(clusterName, topicName);
  }, [clusterName, topicName, deleteTopic]);

  React.useEffect(() => {
    if (isDeleted) {
      dispatch(deleteTopicAction.cancel());
      history.push(clusterTopicsPath(clusterName));
    }
  }, [isDeleted, clusterName, dispatch, history]);

  const clearTopicMessagesHandler = React.useCallback(() => {
    clearTopicMessages({ clusterName, topicName });
    setClearTopicConfirmationVisible(false);
  }, [clusterName, topicName, clearTopicMessages]);

  const recreateTopicHandler = React.useCallback(() => {
    recreateTopic(clusterName, topicName);
    setRecreateTopicConfirmationVisible(false);
  }, [recreateTopic, clusterName, topicName]);

  return (
    <div>
      <PageHeading text={topicName}>
        <HeaderControlsWrapper>
          <Route
            exact
            path="/ui/clusters/:clusterName/topics/:topicName/messages"
          >
            <Button
              buttonSize="M"
              buttonType="primary"
              isLink
              to={clusterTopicSendMessagePath(clusterName, topicName)}
            >
              Produce Message
            </Button>
          </Route>
          {!isReadOnly && !isInternal && (
            <Route path="/ui/clusters/:clusterName/topics/:topicName">
              <Dropdown label={<VerticalElipsisIcon />} right>
                <DropdownItem
                  onClick={() =>
                    history.push(clusterTopicEditPath(clusterName, topicName))
                  }
                >
                  Edit settings
                  <S.DropdownExtraMessage>
                    Pay attention! This operation has
                    <br />
                    especially important consequences.
                  </S.DropdownExtraMessage>
                </DropdownItem>
                {isDeletePolicy && (
                  <DropdownItem
                    onClick={() => setClearTopicConfirmationVisible(true)}
                    danger
                  >
                    Clear messages
                  </DropdownItem>
                )}
                <DropdownItem
                  onClick={() => setRecreateTopicConfirmationVisible(true)}
                  danger
                >
                  Recreate Topic
                </DropdownItem>
                {isTopicDeletionAllowed && (
                  <DropdownItem
                    onClick={() => setDeleteTopicConfirmationVisible(true)}
                    danger
                  >
                    Remove topic
                  </DropdownItem>
                )}
              </Dropdown>
            </Route>
          )}
        </HeaderControlsWrapper>
      </PageHeading>
      <ConfirmationModal
        isOpen={isDeleteTopicConfirmationVisible}
        onCancel={() => setDeleteTopicConfirmationVisible(false)}
        onConfirm={deleteTopicHandler}
      >
        Are you sure want to remove <b>{topicName}</b> topic?
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isClearTopicConfirmationVisible}
        onCancel={() => setClearTopicConfirmationVisible(false)}
        onConfirm={clearTopicMessagesHandler}
      >
        Are you sure want to clear topic messages?
      </ConfirmationModal>
      <ConfirmationModal
        isOpen={isRecreateTopicConfirmationVisible}
        onCancel={() => setRecreateTopicConfirmationVisible(false)}
        onConfirm={recreateTopicHandler}
      >
        Are you sure want to recreate <b>{topicName}</b> topic?
      </ConfirmationModal>
      <Navbar role="navigation">
        <NavLink
          exact
          to={clusterTopicPath(clusterName, topicName)}
          activeClassName="is-active is-primary"
        >
          Overview
        </NavLink>
        <NavLink
          exact
          to={clusterTopicMessagesPath(clusterName, topicName)}
          activeClassName="is-active"
        >
          Messages
        </NavLink>
        <NavLink
          exact
          to={clusterTopicConsumerGroupsPath(clusterName, topicName)}
          activeClassName="is-active"
        >
          Consumers
        </NavLink>
        <NavLink
          exact
          to={clusterTopicSettingsPath(clusterName, topicName)}
          activeClassName="is-active"
        >
          Settings
        </NavLink>
      </Navbar>
      <Switch>
        <Route
          exact
          path={clusterTopicMessagesPath(':clusterName', ':topicName')}
        >
          <Messages />
        </Route>
        <Route
          exact
          path={clusterTopicSettingsPath(':clusterName', ':topicName')}
        >
          <SettingsContainer />
        </Route>
        <Route exact path={clusterTopicPath(':clusterName', ':topicName')}>
          <OverviewContainer />
        </Route>
        <Route
          exact
          path={clusterTopicConsumerGroupsPath(':clusterName', ':topicName')}
        >
          <TopicConsumerGroupsContainer />
        </Route>
      </Switch>
    </div>
  );
};

export default Details;
