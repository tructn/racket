import { Alert, Button, Modal, Switch, Skeleton, Tooltip } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { useMutation } from "@tanstack/react-query";
import cx from "clsx";
import dayjs from "dayjs";
import React, { useMemo, useRef, useState, useCallback } from "react";
import { FaCashRegister } from "react-icons/fa";
import { FiDollarSign } from "react-icons/fi";
import {
  IoBan,
  IoBaseball,
  IoCash,
  IoCopy,
  IoHeartCircle,
  IoMapOutline,
  IoNotificationsCircleOutline,
  IoPersonSharp,
  IoTime,
} from "react-icons/io5";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { FixedSizeList as List } from "react-window";
import formatter from "@/common/formatter";
import httpService from "@/common/httpservice";
import ToggleButton from "@/components/toggle";
import {
  useMesssageTemplateQuery,
  useRegistrationsByMatchQuery,
} from "@/hooks/useQueries";
import { AdditionalCost, MatchSummaryModel, RegistrationModel } from "@/types";
import AdditionalCostEditor from "./additional-cost-editor";
import MatchFigure from "./match-figure";
import { IconCurrencyPound } from "@tabler/icons-react";

interface Prop {
  match: MatchSummaryModel;
}

// Memoized registration row component
const RegistrationRow = React.memo(
  ({
    reg,
    matchId,
    onRegister,
    onUnregister,
    onTogglePaid,
    isRegisterLoading,
    isUnregisterLoading,
    isPaidLoading,
  }: {
    reg: RegistrationModel;
    matchId: number;
    onRegister: (data: RegistrationModel) => void;
    onUnregister: (id: number) => void;
    onTogglePaid: (id: number) => void;
    isRegisterLoading: boolean;
    isUnregisterLoading: boolean;
    isPaidLoading: boolean;
  }) => (
    <div
      className={cx(
        "group relative flex items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white p-4 transition-all hover:border-slate-200 hover:shadow-md",
        { "bg-emerald-50/30": !!reg.registrationId },
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        <div
          className={cx(
            "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white transition-all",
            reg.registrationId
              ? "bg-emerald-500"
              : "bg-slate-200 text-slate-400",
          )}
        >
          {(reg.playerName || "?").charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span
            className={cx("font-medium text-slate-800", {
              "font-bold": !!reg.registrationId,
            })}
          >
            {reg.playerName}
          </span>
          <span className="text-xs text-slate-500">
            {reg.email || "unknown"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!!reg.registrationId ? (
          <>
            <Tooltip label={reg.isPaid ? "Mark as unpaid" : "Mark as paid"}>
              <ToggleButton
                activeColor={reg.isPaid ? "green" : "red"}
                isActive={reg.isPaid}
                isLoading={isPaidLoading}
                onClick={() =>
                  reg.registrationId && onTogglePaid(reg.registrationId)
                }
                icon={<IconCurrencyPound />}
              />
            </Tooltip>
            <Tooltip label="Unregister">
              <ToggleButton
                isActive={true}
                isLoading={isUnregisterLoading}
                activeColor="pink"
                onClick={() =>
                  reg.registrationId && onUnregister(reg.registrationId)
                }
                icon={<IoHeartCircle />}
              />
            </Tooltip>
          </>
        ) : (
          <Tooltip label="Register">
            <ToggleButton
              isActive={false}
              isLoading={isRegisterLoading}
              activeColor="green"
              onClick={() => onRegister({ matchId, playerId: reg.playerId })}
              icon={<IoHeartCircle />}
            />
          </Tooltip>
        )}
      </div>
    </div>
  ),
);

const MatchListContent: React.FC<Prop> = ({ match }) => {
  const clipboardLoc = useClipboard({ timeout: 500 });
  const clipboardRefLoc = useRef<HTMLDivElement>(null!);
  const clipboard = useClipboard({ timeout: 500 });
  const clipboardRef = useRef<HTMLDivElement>(null!);
  const [showAttendantOnly, setShowAttendantOnly] = useState(false);

  const [
    additionalCostOpened,
    { open: openAdditionalCost, close: closeAdditionalCost },
  ] = useDisclosure(false);

  const {
    data: registrations,
    refetch: reload,
    isLoading: isLoadingRegistrations,
  } = useRegistrationsByMatchQuery(match.matchId);

  const { data: messageTemplate } = useMesssageTemplateQuery();

  // Memoized computations
  const stats = useMemo(() => {
    const totalPlayers =
      registrations?.filter((r) => !!r.registrationId).length ?? 0;
    const totalRegistrations = registrations?.length ?? 0;

    return {
      percentage: Math.round((totalPlayers / totalRegistrations) * 100),
      paid:
        registrations?.filter((r) => r.registrationId && !!r.isPaid).length ??
        0,
      unpaid:
        registrations?.filter((r) => r.registrationId && !r.isPaid).length ?? 0,
      totalPlayers,
      individualCost:
        totalPlayers === 0
          ? 0
          : ((match.cost ?? 0) + (match.additionalCost ?? 0)) / totalPlayers,
    };
  }, [match.cost, match.additionalCost, registrations]);

  const costMessage = useMemo(() => {
    const bindTemplate = (template: string, data: any) => {
      return template.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()]);
    };

    return bindTemplate(messageTemplate ?? "", {
      cost: match?.cost?.toFixed(2),
      customSection: match?.customSection,
      additionalCost: match.additionalCost?.toFixed(2),
      individualCost: stats.individualCost?.toFixed(2),
      totalPlayer: stats.totalPlayers,
    });
  }, [match, stats, messageTemplate]);

  // Memoized mutations
  const regMut = useMutation({
    onSuccess: reload,
    mutationFn: (model: RegistrationModel) =>
      httpService.post("api/v1/registrations", model),
  });

  const unregMut = useMutation({
    onSuccess: reload,
    mutationFn: (registrationId: number) =>
      httpService.del(`api/v1/registrations/${registrationId}`),
  });

  const paidMut = useMutation({
    onSuccess: reload,
    mutationFn: (registrationId: number) =>
      httpService.put(`api/v1/registrations/${registrationId}/paid`, {}),
  });

  const unpaidMut = useMutation({
    onSuccess: reload,
    mutationFn: (registrationId: number) =>
      httpService.put(`api/v1/registrations/${registrationId}/unpaid`, {}),
  });

  const handleSaveAdditionalCosts = useCallback(
    async (costs: AdditionalCost[]) => {
      await httpService.put(
        `api/v1/matches/${match.matchId}/additional-costs`,
        costs,
      );
      closeAdditionalCost();
    },
    [match.matchId],
  );

  const filteredRegistrations = useMemo(
    () =>
      registrations?.filter(
        (r) => showAttendantOnly === false || r.registrationId,
      ) ?? [],
    [registrations, showAttendantOnly],
  );

  const renderRegistrationRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const reg = filteredRegistrations[index];
      return (
        <div style={style}>
          <RegistrationRow
            reg={reg}
            matchId={match.matchId}
            onRegister={regMut.mutate}
            onUnregister={unregMut.mutate}
            onTogglePaid={(id) =>
              reg.isPaid ? unpaidMut.mutate(id) : paidMut.mutate(id)
            }
            isRegisterLoading={regMut.isPending}
            isUnregisterLoading={unregMut.isPending}
            isPaidLoading={unpaidMut.isPending || paidMut.isPending}
          />
        </div>
      );
    },
    [
      filteredRegistrations,
      match.matchId,
      regMut,
      unregMut,
      paidMut,
      unpaidMut,
    ],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            <Alert
              className="relative"
              color="orange"
              title="Match Details"
              icon={<IoMapOutline />}
            >
              <div className="flex flex-col gap-2" ref={clipboardRefLoc}>
                <div className="flex items-center gap-2">
                  <span>
                    <span>🗺️ Location: </span>
                    <span className="font-bold">{match.sportCenterName}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>
                    {dayjs(match.start).format("hh:mm A")}
                    <span> to </span>
                    {dayjs(match.end).format("hh:mm A")}
                    <span> | </span>
                    {dayjs(match.start).format("dddd DD-MM-YYYY")}
                  </span>
                </div>
              </div>
              <Button
                className="absolute right-2 top-2"
                variant="light"
                leftSection={<IoCopy />}
                color={clipboardLoc.copied ? "purple" : "orange"}
                onClick={() =>
                  clipboardLoc.copy(clipboardRefLoc.current.innerText)
                }
              >
                {clipboardLoc.copied ? "Copied" : "Copy"}
              </Button>
            </Alert>

            {costMessage && (
              <Alert
                className="relative"
                variant="light"
                color="green"
                title="Message"
                icon={<IoNotificationsCircleOutline />}
              >
                <div ref={clipboardRef}>
                  <Markdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {costMessage}
                  </Markdown>
                </div>
                <Button
                  className="absolute right-2 top-2"
                  variant="light"
                  leftSection={<IoCopy />}
                  color={clipboard.copied ? "red" : "green"}
                  onClick={() => clipboard.copy(clipboardRef.current.innerText)}
                >
                  {clipboard.copied ? "Copied" : "Copy"}
                </Button>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 justify-between gap-3 md:grid-cols-2 xl:grid-cols-3">
            <MatchFigure
              icon={<IoTime />}
              label="Duration"
              figure={formatter.duration(match.start, match.end)}
              color="blue"
            />

            <MatchFigure
              icon={<IoPersonSharp />}
              label="Total players"
              figure={stats.totalPlayers?.toString()}
              color="sky"
            />

            <MatchFigure
              icon={<IoCash />}
              label="Paid"
              figure={stats.paid?.toString()}
              color="blue"
            />

            <MatchFigure
              icon={<IoBan />}
              label="Unpaid"
              figure={stats.unpaid?.toString()}
              color="sky"
            />

            <MatchFigure
              icon={<IoBaseball />}
              label="Attendant percent"
              figure={`${stats.percentage}%`}
              color="blue"
            />

            <MatchFigure
              icon={<FiDollarSign />}
              label="Cost"
              figure={formatter.currency(match.cost ?? 0)}
              color="sky"
            />

            <MatchFigure
              icon={<FaCashRegister />}
              label="Additional cost"
              figure={formatter.currency(match.additionalCost ?? 0)}
              onActionClick={openAdditionalCost}
              color="blue"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2">
                  <IoPersonSharp className="text-xl text-slate-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Registrations
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage player registrations and payments
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  Show attendant only
                </span>
                <Switch
                  checked={showAttendantOnly}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setShowAttendantOnly(event.currentTarget.checked)
                  }
                  size="md"
                />
              </div>
            </div>

            {isLoadingRegistrations ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} height={72} radius="md" />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
                <List
                  height={400}
                  itemCount={filteredRegistrations.length}
                  itemSize={72}
                  width="100%"
                >
                  {renderRegistrationRow}
                </List>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        opened={additionalCostOpened}
        onClose={closeAdditionalCost}
        title="Add Additional Cost"
      >
        <AdditionalCostEditor onSaveClick={handleSaveAdditionalCosts} />
      </Modal>
    </div>
  );
};

export default React.memo(MatchListContent);
