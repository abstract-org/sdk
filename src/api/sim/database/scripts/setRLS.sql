-- agora-labs.com policies for every table
ALTER TABLE snapshot_wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON snapshot_wallet FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON snapshot_wallet FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE snapshot_pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON snapshot_pool FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON snapshot_pool FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE snapshot_quest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON snapshot_quest FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON snapshot_quest FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE scenario_quest_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON scenario_quest_config FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON scenario_quest_config FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE snapshot_totals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON snapshot_totals FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON snapshot_totals FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE scenario_wallet_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON scenario_wallet_config FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON scenario_wallet_config FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE wallet_navs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON wallet_navs FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON wallet_navs FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE wallet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON wallet FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON wallet FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE wallet_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON wallet_balances FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON wallet_balances FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON log FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON log FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE pool_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON pool_data FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON pool_data FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE position ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON position FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON position FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');


ALTER TABLE scenario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON scenario FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON scenario FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE pool ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON pool FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON pool FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE position_owner ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON position_owner FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON position_owner FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE quest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON quest FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON quest FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON snapshot FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON snapshot FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');

ALTER TABLE swap ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read for everyone" ON swap FOR SELECT USING (true);
CREATE POLICY "Only agora-labs.com staff can insert"
ON swap FOR INSERT
TO authenticated
WITH CHECK (right(auth.jwt() ->> 'email', 15) LIKE '@agora-labs.com');
